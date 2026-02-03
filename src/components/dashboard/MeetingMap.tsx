import L from 'leaflet'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

// Fix for default Leaflet markers in React/Vite
const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MeetingMapProps {
  lat: number
  lng: number
  title?: string
  address?: string
}

export function MeetingMap({ lat, lng, title, address }: MeetingMapProps) {
  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-border/50 relative z-0">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="p-1">
              <h3 className="font-semibold text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {title || 'Meeting Location'}
              </h3>
              {address && (
                <p className="text-xs text-muted-foreground mt-1">{address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
