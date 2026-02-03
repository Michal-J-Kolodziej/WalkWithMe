import { useMutation, useQuery } from 'convex/react'
import { Calendar, Check, Clock, Loader2, MapPin, Users, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { GlassCard } from './DashboardWidgets'

interface MeetingInvitation {
  _id: Id<'meetingInvitations'>
  meetingId: Id<'meetings'>
  fromUserId: Id<'users'>
  status: string
  createdAt: number
  meeting: {
    _id: Id<'meetings'>
    title: string
    description?: string
    location: {
      lat: number
      lng: number
      address?: string
    }
    dateTime: number
  } | null
  fromUser: {
    _id: Id<'users'>
    name?: string
    image?: string
  } | null
  participantCount: number
}

interface MeetingInvitationCardProps {
  invitation: MeetingInvitation
}

export function MeetingInvitationCard({
  invitation,
}: MeetingInvitationCardProps) {
  const dogs = useQuery(api.dogs.listByOwner)
  const acceptInvitation = useMutation(api.meetingInvitations.accept)
  const declineInvitation = useMutation(api.meetingInvitations.decline)

  const [showDogSelection, setShowDogSelection] = useState(false)
  const [selectedDogs, setSelectedDogs] = useState<Array<Id<'dogs'>>>([])
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const [error, setError] = useState('')

  if (!invitation.meeting) {
    return null
  }

  const { meeting, fromUser, participantCount } = invitation

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }
  }

  const { date, time } = formatDateTime(meeting.dateTime)

  const toggleDog = (dogId: Id<'dogs'>) => {
    setSelectedDogs((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId],
    )
  }

  const handleAccept = async () => {
    if (selectedDogs.length === 0) {
      setError('Please select at least one dog to bring')
      return
    }

    setIsAccepting(true)
    setError('')

    try {
      await acceptInvitation({
        invitationId: invitation._id,
        dogIds: selectedDogs,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to accept invitation',
      )
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    setIsDeclining(true)
    setError('')

    try {
      await declineInvitation({
        invitationId: invitation._id,
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to decline invitation',
      )
    } finally {
      setIsDeclining(false)
    }
  }

  return (
    <GlassCard hover={false}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {meeting.title}
            </h3>
            {fromUser && (
              <p className="text-sm text-muted-foreground">
                Invited by {fromUser.name || 'Unknown'}
              </p>
            )}
          </div>
          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full flex-shrink-0">
            Invitation
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          {meeting.location?.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{meeting.location.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{participantCount} already attending</span>
          </div>
          <MeetingWeather
            lat={meeting.location.lat}
            lng={meeting.location.lng}
            dateTime={meeting.dateTime}
            compact
            className="pt-1"
          />
        </div>

        {meeting.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {meeting.description}
          </p>
        )}

        {/* Dog Selection */}
        {showDogSelection && (
          <div className="border-t border-border/50 pt-4">
            <label className="block text-sm font-medium mb-2">
              Which dogs are you bringing?
            </label>
            {dogs === undefined ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : dogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                You need to add a dog first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {dogs.map((dog) => (
                  <button
                    key={dog._id}
                    type="button"
                    onClick={() => toggleDog(dog._id)}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer text-left
                      ${
                        selectedDogs.includes(dog._id)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {dog.imageUrl ? (
                        <img
                          src={dog.imageUrl}
                          alt={dog.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">
                          🐕
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-sm truncate">
                      {dog.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {!showDogSelection ? (
            <>
              <button
                onClick={() => setShowDogSelection(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg
                  bg-primary text-primary-foreground font-medium
                  hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={handleDecline}
                disabled={isDeclining}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg
                  border border-border font-medium
                  hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50
                  transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeclining ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Decline
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowDogSelection(false)
                  setSelectedDogs([])
                  setError('')
                }}
                className="flex-1 py-2 rounded-lg border border-border font-medium
                  hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                disabled={isAccepting || selectedDogs.length === 0}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg
                  bg-primary text-primary-foreground font-medium
                  hover:bg-primary/90 transition-colors cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Join Meeting
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
