import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useBeacon } from '@/hooks/useBeacon'
import { useLocationTracker } from '@/hooks/useLocationTracker'
import { useSpots } from '@/hooks/useSpots'
import { useWalkTracker } from '@/hooks/useWalkTracker'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Locate, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { Id } from '../../../../convex/_generated/dataModel'
import { ActiveWalkOverlay } from '../walk/ActiveWalkOverlay'
import { WalkTrackerControls } from '../walk/WalkTrackerControls'
import { AddSpotModal } from './AddSpotModal'
import { BeaconMarker } from './BeaconMarker'
import { FloatingMapHeader } from './FloatingMapHeader'
import { SpotDetailsSheet } from './SpotDetailsSheet'

// Custom icons per type could be added here
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

type SpotType = 'park' | 'vet' | 'store' | 'cafe'

const SPOT_TYPES: { type: SpotType; label: string; color: string }[] = [
  { type: 'park', label: 'Parks', color: 'bg-green-500' },
  { type: 'vet', label: 'Vets', color: 'bg-red-500' },
  { type: 'store', label: 'Stores', color: 'bg-blue-500' },
  { type: 'cafe', label: 'Cafes', color: 'bg-orange-500' },
]

export function SpotsMap() {
  const { spots, isLoading } = useSpots()
  const [activeFilters, setActiveFilters] = useState<SpotType[]>(['park', 'vet', 'store', 'cafe'])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpotId, setSelectedSpotId] = useState<Id<'spots'> | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newSpotLocation, setNewSpotLocation] = useState<{ lat: number; lng: number } | null>(null)

  const { activeWalkers } = useBeacon()
  const userLocation = useLocationTracker()
  const { status: walkStatus, routePoints } = useWalkTracker()

  // Center map on Warsaw by default, or user location if available (can be enhanced)
  const defaultCenter = { lat: 52.2297, lng: 21.0122 }

  const filteredSpots = useMemo(() => {
    if (!spots) return []
    return spots.filter((spot) => {
      const matchesType = activeFilters.includes(spot.type as SpotType)
      const matchesSearch = searchTerm 
        ? spot.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (spot.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
        : true
      return matchesType && matchesSearch
    })
  }, [spots, activeFilters, searchTerm])

  const toggleFilter = (type: SpotType) => {
    setActiveFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  // Handler for map clicks to add new spot
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        // Only allow adding if we are in "Add Mode" - or just right click? 
        // For simplicity, let's have a dedicated "Add Spot Here" button in UI, 
        // but physically clicking the map to drop a pin is better UX.
        // Let's stick to the button triggering the modal with center screen or current location.
        // Or, we can capture the click:
        // setNewSpotLocation(e.latlng)
        // setIsAddModalOpen(true)
      },
      contextmenu(e) { 
          setNewSpotLocation(e.latlng)
          setIsAddModalOpen(true)
      }
    })
    return null
  }

  // Component to handle "locate me" functionality
  function LocateMeControl({ trigger }: { trigger: number }) {
    const map = useMap()
    
    // When trigger changes and we have location, fly to it
    if (trigger > 0 && userLocation.latitude && userLocation.longitude) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 15, { duration: 1 })
    }
    
    return null
  }

  const [locateTrigger, setLocateTrigger] = useState(0)
  
  const handleLocateMe = () => {
    if (userLocation.latitude && userLocation.longitude) {
      setLocateTrigger(prev => prev + 1)
    }
  }

  const handleAddSpotClick = () => {
    // Default to map center or predefined location if manual click
    setNewSpotLocation(defaultCenter) 
    setIsAddModalOpen(true)
  }

  if (isLoading) return <div className="p-10 text-center">Loading map...</div>

  return (
    <div className="relative h-full w-full overflow-hidden border border-border shadow-sm z-0">
      <FloatingMapHeader onSearch={setSearchTerm} />

      {/* Active Walk Overlay */}
      <ActiveWalkOverlay />

      {/* Horizontal Filter Bar */}
      <div className="absolute top-20 left-0 right-0 z-[5] px-4 overflow-x-auto no-scrollbar">
        <div className="mx-auto max-w-md w-full flex gap-2 pb-2">
            {SPOT_TYPES.map((t) => {
              const isActive = activeFilters.includes(t.type)
              return (
                <button
                  key={t.type}
                  onClick={() => toggleFilter(t.type)}
                  className={`
                    group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg backdrop-blur-md border whitespace-nowrap
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/20 scale-105' 
                      : 'bg-black/40 text-white/90 border-white/10 hover:bg-black/50'
                    }
                  `}
                >
                  <span className={`
                    w-2 h-2 rounded-full shadow-sm
                    ${isActive ? 'bg-white' : t.color}
                  `} />
                  {t.label}
                </button>
              )
            })}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-24 right-6 z-[5] flex flex-col gap-3">
        {/* Locate Me Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                  size="lg" 
                  className="rounded-full h-12 w-12 shadow-lg bg-white hover:bg-gray-50 hover:scale-110 active:scale-95 transition-all duration-300 group border border-gray-200 p-0 flex items-center justify-center"
                  onClick={handleLocateMe}
                  disabled={!userLocation.latitude || !userLocation.longitude}
              >
                <Locate className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/80 text-white border-white/10 backdrop-blur-md">
              <p>My Location</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Add Spot Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                  size="lg" 
                  className="rounded-full h-16 w-16 shadow-[0_0_20px_rgba(249,115,22,0.4)] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:scale-110 active:scale-95 transition-all duration-300 group border-2 border-white/20 p-0 flex items-center justify-center overflow-hidden"
                  onClick={handleAddSpotClick}
              >
                <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300 shrink-0" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-black/80 text-white border-white/10 backdrop-blur-md">
              <p>Add Dog-Friendly Spot</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Walk Tracker Controls */}
      <div className="absolute bottom-24 left-6 z-[5]">
        <WalkTrackerControls compact />
      </div>

      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapClickHandler />
        <LocateMeControl trigger={locateTrigger} />

        {/* User Current Location Marker */}
        {userLocation.latitude && userLocation.longitude && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              className: 'user-location-marker',
              html: `
                <div class="relative flex items-center justify-center">
                  <div class="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30 scale-[2.5]"></div>
                  <div class="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
                </div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* Active Walker Beacons */}
        {/* Live Walk Route */}
        {walkStatus !== 'idle' && routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{
              color: '#22c55e',
              weight: 4,
              opacity: 0.8,
              dashArray: walkStatus === 'paused' ? '10, 10' : undefined,
            }}
          />
        )}

        {activeWalkers.map((walker) => (
          <BeaconMarker key={walker._id} walker={walker} />
        ))}
        
        {filteredSpots.map((spot) => (
          <Marker 
            key={spot._id} 
            position={spot.location}
            eventHandlers={{
                click: () => {
                    setSelectedSpotId(spot._id)
                }
            }}
          >
          </Marker>
        ))}
      </MapContainer>

      {/* Details Sheet/Modal */}
      {selectedSpotId && (
        <SpotDetailsSheet 
            spotId={selectedSpotId} 
            isOpen={!!selectedSpotId} 
            onClose={() => setSelectedSpotId(null)} 
        />
      )}

      {/* Add Spot Modal */}
      {isAddModalOpen && newSpotLocation && (
        <AddSpotModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)}
            initialLocation={newSpotLocation}
        />
      )}
    </div>
  )
}
