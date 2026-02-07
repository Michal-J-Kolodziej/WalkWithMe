import { useQuery } from 'convex/react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { api } from '../../../../convex/_generated/api'

// Simple heatmap implementation using circles
// For production, consider using leaflet.heat for better performance
function HeatmapLayer({ points }: { points: Array<{ latitude: number; longitude: number }> }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) return

    // Count frequency at each location (rounded to ~10m grid)
    const frequencyMap = new Map<string, { lat: number; lng: number; count: number }>()
    
    for (const point of points) {
      // Round to ~10m precision
      const key = `${point.latitude.toFixed(4)},${point.longitude.toFixed(4)}`
      const existing = frequencyMap.get(key)
      if (existing) {
        existing.count++
      } else {
        frequencyMap.set(key, { lat: point.latitude, lng: point.longitude, count: 1 })
      }
    }

    // Find max count for normalization
    let maxCount = 1
    for (const data of frequencyMap.values()) {
      if (data.count > maxCount) maxCount = data.count
    }

    // Create circle markers
    const circles: L.Circle[] = []
    for (const data of frequencyMap.values()) {
      const intensity = data.count / maxCount
      const color = getHeatColor(intensity)
      const radius = 20 + intensity * 30 // 20-50m radius

      const circle = L.circle([data.lat, data.lng], {
        radius,
        color: 'transparent',
        fillColor: color,
        fillOpacity: 0.4 + intensity * 0.3,
        stroke: false,
      }).addTo(map)

      circles.push(circle)
    }

    // Fit bounds to show all points
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      circles.forEach((c) => c.remove())
    }
  }, [map, points])

  return null
}

// Get color based on intensity (0-1)
function getHeatColor(intensity: number): string {
  // Blue -> Cyan -> Green -> Yellow -> Orange -> Red
  if (intensity < 0.2) return '#3b82f6' // blue
  if (intensity < 0.4) return '#22d3ee' // cyan
  if (intensity < 0.6) return '#22c55e' // green
  if (intensity < 0.8) return '#eab308' // yellow
  if (intensity < 0.9) return '#f97316' // orange
  return '#ef4444' // red
}

export function WalkHeatmap() {
  const routePoints = useQuery(api.walks.getAllRoutePoints)

  // Default center (Warsaw)
  const defaultCenter: [number, number] = [52.2297, 21.0122]

  if (routePoints === undefined) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (routePoints.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/50 text-muted-foreground">
        <div className="text-center">
          <p className="font-medium">No walk data yet</p>
          <p className="text-sm">Complete some walks to see your heatmap</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <HeatmapLayer points={routePoints} />
    </MapContainer>
  )
}
