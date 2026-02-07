import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMemo } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet'

// Custom icons
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface RoutePoint {
  latitude: number
  longitude: number
  timestamp: number
}

interface WalkRouteMapProps {
  routePoints: Array<RoutePoint>
  interactive?: boolean
}

// Component to fit map to route bounds
function FitBounds({ points }: { points: Array<[number, number]> }) {
  const map = useMap()

  if (points.length > 0) {
    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [20, 20] })
  }

  return null
}

export function WalkRouteMap({
  routePoints,
  interactive = false,
}: WalkRouteMapProps) {
  // Convert route points to Leaflet format
  const positions = useMemo(() => {
    return routePoints
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((p): [number, number] => [p.latitude, p.longitude])
  }, [routePoints])

  // Default center if no points
  const center: [number, number] =
    positions.length > 0 ? positions[0] : [52.2297, 21.0122] // Warsaw

  if (positions.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/50 text-muted-foreground">
        No route data
      </div>
    )
  }

  return (
    <MapContainer
      center={center}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={interactive}
      dragging={interactive}
      zoomControl={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FitBounds points={positions} />

      {/* Route line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#22c55e',
          weight: 4,
          opacity: 0.8,
        }}
      />

      {/* Start marker */}
      <Marker
        position={positions[0]}
        icon={L.divIcon({
          className: 'start-marker',
          html: `
          <div class="flex items-center justify-center">
            <div class="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-lg"></div>
          </div>
        `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })}
      />

      {/* End marker */}
      {positions.length > 1 && (
        <Marker
          position={positions[positions.length - 1]}
          icon={L.divIcon({
            className: 'end-marker',
            html: `
            <div class="flex items-center justify-center">
              <div class="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg"></div>
            </div>
          `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        />
      )}
    </MapContainer>
  )
}
