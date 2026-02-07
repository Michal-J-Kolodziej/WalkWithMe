import L from 'leaflet'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useSpots } from '@/hooks/useSpots'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'

// Fix for default Leaflet markers
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface AddSpotModalProps {
  isOpen: boolean
  onClose: () => void
  initialLocation: { lat: number; lng: number }
}

interface FormData {
  name: string
  type: string
  description: string
  address: string
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: { lat: number; lng: number }
  setPosition: (pos: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })
  return <Marker position={position} />
}

export function AddSpotModal({
  isOpen,
  onClose,
  initialLocation,
}: AddSpotModalProps) {
  const { createSpot } = useSpots()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [location, setLocation] = useState(initialLocation)
  const { register, handleSubmit, setValue } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await createSpot({
        name: data.name,
        type: data.type,
        description: data.description,
        address: data.address, // Ideally we'd reverse geocode here too
        location: location,
      })
      onClose()
    } catch (error) {
      console.error('Failed to create spot', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Dog-Friendly Spot</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder="e.g. Sunny Park"
                className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-2">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select onValueChange={(val) => setValue('type', val)} required>
                <SelectTrigger className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="park">🌳 Park</SelectItem>
                  <SelectItem value="vet">🏥 Vet Clinic</SelectItem>
                  <SelectItem value="store">🏪 Pet Store</SelectItem>
                  <SelectItem value="cafe">☕ Cafe / Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              {...register('address', { required: true })}
              placeholder="Street address or distinct landmark"
              className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center justify-between text-muted-foreground text-sm font-medium">
              <span>Location Preview</span>
              <span className="text-xs opacity-70">Click map to adjust</span>
            </Label>
            <div className="h-[220px] rounded-xl overflow-hidden border border-primary/20 shadow-inner relative group">
              <MapContainer
                center={location}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={location} setPosition={setLocation} />
              </MapContainer>
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Share details about fencing, water availability, or rules..."
              className="bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors min-h-[80px] resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Create Spot'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
