import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
    ArrowLeft,
    Calendar,
    Clock,
    Dog,
    Loader2,
    MapPin,
    Trash2,
    UserPlus,
    Users
} from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { GlassCard } from '../../components/dashboard/DashboardWidgets'
import { InviteFriendsModal } from '../../components/dashboard/InviteFriendsModal'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

export const Route = createFileRoute('/dashboard/meetings/$meetingId')({
  component: MeetingDetailsPage,
})

function MeetingDetailsPage() {
  const { meetingId } = Route.useParams()
  const navigate = useNavigate()
  const user = useQuery(api.users.current)
  const meeting = useQuery(api.meetings.get, {
    meetingId: meetingId as Id<'meetings'>,
  })
  const invitations = useQuery(api.meetingInvitations.listForMeeting, {
    meetingId: meetingId as Id<'meetings'>,
  })

  const deleteMeeting = useMutation(api.meetings.remove)
  const leaveMeeting = useMutation(api.meetings.leave)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  // Loading state
  if (user === undefined || meeting === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or meeting not found
  if (user === null || meeting === null) {
    return (
      <DashboardLayout user={user}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Meeting not found</h2>
          <p className="text-muted-foreground mb-4">
            This meeting may have been deleted or you don't have access.
          </p>
          <Link
            to="/dashboard/meetings"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Meetings
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }
  }

  const { date, time } = formatDateTime(meeting.dateTime)
  const isPast = meeting.dateTime < Date.now()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteMeeting({ meetingId: meeting._id })
      navigate({ to: '/dashboard/meetings' })
    } catch (err) {
      console.error('Failed to delete meeting:', err)
      setIsDeleting(false)
    }
  }

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this meeting?')) {
      return
    }

    setIsLeaving(true)
    try {
      await leaveMeeting({ meetingId: meeting._id })
      navigate({ to: '/dashboard/meetings' })
    } catch (err) {
      console.error('Failed to leave meeting:', err)
      setIsLeaving(false)
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6 max-w-4xl">
        {/* Back link */}
        <Link
          to="/dashboard/meetings"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Meetings
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{meeting.title}</h1>
              {isPast && (
                <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                  Past
                </span>
              )}
              {meeting.isOwner && (
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  Organizer
                </span>
              )}
            </div>
            {meeting.owner && (
              <p className="text-muted-foreground">
                Organized by {meeting.owner.name}
              </p>
            )}
          </div>

          {/* Actions */}
          {meeting.isOwner && !isPast && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  bg-primary text-primary-foreground font-medium
                  hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Invite Friends
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                  border border-border text-destructive
                  hover:bg-destructive/10 transition-colors cursor-pointer
                  disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </button>
            </div>
          )}

          {!meeting.isOwner && meeting.isParticipant && !isPast && (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                border border-border text-destructive
                hover:bg-destructive/10 transition-colors cursor-pointer
                disabled:opacity-50"
            >
              {isLeaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Leave Meeting'
              )}
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <GlassCard hover={false}>
              <h2 className="font-semibold text-lg mb-4">Details</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{date}</p>
                    <p className="text-sm text-muted-foreground">Date</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{time}</p>
                    <p className="text-sm text-muted-foreground">Time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {meeting.location.address || 'Location set on map'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.location.lat.toFixed(4)}, {meeting.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {meeting.description && (
                <div className="mt-6 pt-4 border-t border-border/50">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {meeting.description}
                  </p>
                </div>
              )}
            </GlassCard>

            {/* Participants */}
            <GlassCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Participants ({meeting.participants.length})
                </h2>
              </div>

              <div className="space-y-4">
                {meeting.participants.map((participant) => (
                  <div
                    key={participant._id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {participant.user?.image ? (
                        <img
                          src={participant.user.image}
                          alt={participant.user.name || ''}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {participant.user?.name || 'Unknown'}
                        </p>
                        {participant.userId === meeting.ownerId && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                            Organizer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Dog className="w-4 h-4" />
                        <span>
                          {participant.dogs.length} dog{participant.dogs.length !== 1 ? 's' : ''}:
                          {' '}
                          {participant.dogs.map((d) => d?.name).filter(Boolean).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Invitations (owner only) */}
            {meeting.isOwner && invitations && invitations.length > 0 && (
              <GlassCard hover={false}>
                <h2 className="font-semibold text-lg mb-4">Pending Invitations</h2>
                <div className="space-y-3">
                  {invitations
                    .filter((inv) => inv.status === 'pending')
                    .map((invitation) => (
                      <div
                        key={invitation._id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {invitation.toUser?.image ? (
                            <img
                              src={invitation.toUser.image}
                              alt={invitation.toUser.name || ''}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {invitation.toUser?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Pending
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </GlassCard>
            )}

            {/* Quick Stats */}
            <GlassCard hover={false}>
              <h2 className="font-semibold text-lg mb-4">Quick Info</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-medium">{meeting.participants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Dogs</span>
                  <span className="font-medium">
                    {meeting.participants.reduce((acc, p) => acc + p.dogs.length, 0)}
                  </span>
                </div>
                {invitations && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pending Invites</span>
                    <span className="font-medium">
                      {invitations.filter((i) => i.status === 'pending').length}
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <InviteFriendsModal
          meetingId={meeting._id}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </DashboardLayout>
  )
}
