import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from 'react-leaflet'

// Fix for default Leaflet markers in React/Vite
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface LocationPickerProps {
  initialLat?: number
  initialLng?: number
  onLocationSelect: (location: {
    lat: number
    lng: number
    address?: string
  }) => void
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: { lat: number; lng: number } | null
  setPosition: (pos: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      // map.flyTo handled by parent effect via center prop update
    },
  })

  return position === null ? null : <Marker position={position} />
}

function UserLocationMarker({
  position,
}: {
  position: { lat: number; lng: number } | null
}) {
  return position === null ? null : (
    <CircleMarker
      center={position}
      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.7 }}
      radius={8}
    >
      <Popup>You are here</Popup>
    </CircleMarker>
  )
}

// Helper to control map view from parent state
function MapController({
  center,
  zoom,
}: {
  center: { lat: number; lng: number }
  zoom: number
}) {
  const map = useMapEvents({})

  useEffect(() => {
    map.flyTo(center, zoom)
  }, [center, zoom, map])

  return null
}

export function LocationPicker({
  // ... (rest of props)
  initialLat,
  initialLng,
  onLocationSelect,
}: LocationPickerProps) {
  const [position, setPosition] = useState<{
    lat: number
    lng: number
  } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        const newPos = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        }
        setPosition(newPos)
        onLocationSelect({
          lat: newPos.lat,
          lng: newPos.lng,
          address: result.display_name,
        })
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleManualSetPosition = async (pos: { lat: number; lng: number }) => {
    setPosition(pos)
    // Reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}`,
      )
      const data = await response.json()
      onLocationSelect({
        lat: pos.lat,
        lng: pos.lng,
        address: data.display_name,
      })
    } catch (error) {
      // Fallback if reverse geocoding fails
      onLocationSelect({
        lat: pos.lat,
        lng: pos.lng,
      })
    }
  }

  const [userPosition, setUserPosition] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // Check for user's location if no initial position is set
  useEffect(() => {
    if (initialLat && initialLng) return

    if ('geolocation' in navigator) {
      setIsSearching(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setUserPosition({ lat: latitude, lng: longitude })
          setIsSearching(false)
        },
        (error) => {
          console.error('Geolocation error:', error)
          setIsSearching(false)
        },
        { timeout: 10000 },
      )
    }
  }, [initialLat, initialLng])

  // Default to somewhere central if no initial pos (e.g. Warsaw)
  // Prioritize user's location if available for the center
  const center = position || userPosition || { lat: 52.2297, lng: 21.0122 }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border
              focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch(e)
              }
            }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium
            hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Search'
          )}
        </button>
      </div>

      <div className="h-[300px] rounded-xl overflow-hidden border border-border z-0 relative">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={center} zoom={13} />
          <LocationMarker
            position={position}
            setPosition={handleManualSetPosition}
          />
          <UserLocationMarker position={userPosition} />
        </MapContainer>
      </div>
    </div>
  )
}
