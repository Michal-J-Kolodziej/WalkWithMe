import { useMutation, useQuery } from 'convex/react'
import { Calendar, Clock, Loader2, MapPin, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { LocationPicker } from '../common/LocationPicker'
import type { Id } from '../../../convex/_generated/dataModel'

interface CreateMeetingModalProps {
  onClose: () => void
}

export function CreateMeetingModal({ onClose }: CreateMeetingModalProps) {
  const dogs = useQuery(api.dogs.listByOwner)
  const createMeeting = useMutation(api.meetings.create)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [selectedDogs, setSelectedDogs] = useState<Array<Id<'dogs'>>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const toggleDog = (dogId: Id<'dogs'>) => {
    setSelectedDogs((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a meeting title')
      return
    }

    if (!date || !time) {
      setError('Please select a date and time')
      return
    }

    if (selectedDogs.length === 0) {
      setError('Please select at least one dog to bring')
      return
    }

    if (!lat || !lng) {
      setError('Please enter a location')
      return
    }

    setIsSubmitting(true)

    try {
      const dateTime = new Date(`${date}T${time}`).getTime()

      await createMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        location: {
          lat,
          lng,
          address: address.trim() || undefined,
        },
        dateTime,
        dogIds: selectedDogs,
      })

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create meeting')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Create Meeting</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Meeting Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning walk in the park"
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border
                focus:outline-none focus:ring-2 focus:ring-primary/50
                placeholder:text-muted-foreground"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any notes about the meeting..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border
                focus:outline-none focus:ring-2 focus:ring-primary/50
                placeholder:text-muted-foreground resize-none"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border
                  focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border
                  focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location *
            </label>
            <LocationPicker
              onLocationSelect={(loc) => {
                setLat(loc.lat)
                setLng(loc.lng)
                setAddress(loc.address || '')
              }}
            />
            {address && (
              <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">Selected: </span>
                {address}
              </div>
            )}
          </div>

          {/* Select Dogs */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Which dogs are you bringing? *
            </label>
            {dogs === undefined ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : dogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                You need to add a dog first before creating a meeting.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {dogs.map((dog) => (
                  <button
                    key={dog._id}
                    type="button"
                    onClick={() => toggleDog(dog._id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                      ${
                        selectedDogs.includes(dog._id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {dog.imageUrl ? (
                        <img
                          src={dog.imageUrl}
                          alt={dog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          🐕
                        </div>
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-medium truncate">{dog.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {dog.breed}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border
                font-medium hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !dogs || dogs.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground
                font-medium hover:bg-primary/90 transition-colors cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Meeting'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
