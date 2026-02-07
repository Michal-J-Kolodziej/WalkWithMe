import { formatDistanceToNow } from 'date-fns'
import { enUS, pl } from 'date-fns/locale'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'
import { Marker, Popup } from 'react-leaflet'

interface Walker {
  _id: string
  name?: string
  image?: string
  geo_location?: {
    latitude: number
    longitude: number
    updatedAt: number
  }
  beacon?: {
    isActive: boolean
    startedAt: number
    lastHeartbeat?: number
    privacy: string
  }
}

interface BeaconMarkerProps {
  walker: Walker
}

export function BeaconMarker({ walker }: BeaconMarkerProps) {
  const { i18n, t } = useTranslation()
  const locale = i18n.language === 'pl' ? pl : enUS

  // Skip if no geo_location
  if (!walker.geo_location) return null

  const { latitude, longitude } = walker.geo_location
  const avatarUrl =
    walker.image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${walker._id}`
  const displayName = walker.name || 'Friend'

  const customIcon = L.divIcon({
    html: `
      <div class="beacon-marker-container">
        <!-- Pulse effect -->
        <div class="beacon-pulse-outer"></div>
        <div class="beacon-pulse-inner"></div>
        
        <!-- Avatar container -->
        <div class="beacon-avatar">
          <img src="${avatarUrl}" alt="${displayName}" />
        </div>
        
        <!-- Status indicator -->
        <div class="beacon-status"></div>
      </div>
    `,
    className: 'custom-beacon-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  })

  return (
    <Marker position={[latitude, longitude]} icon={customIcon}>
      <Popup className="beacon-popup">
        <div className="p-2 min-w-[120px]">
          <p className="font-bold text-foreground text-sm">{displayName}</p>
          <p className="text-xs text-orange-600 font-medium mb-1">
            🚶 {t('beacon.walking_now', 'Walking Now')}
          </p>
          {walker.beacon?.startedAt && (
            <p className="text-[10px] text-muted-foreground">
              {t('beacon.started', 'Started')}{' '}
              {formatDistanceToNow(walker.beacon.startedAt, {
                addSuffix: true,
                locale,
              })}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
