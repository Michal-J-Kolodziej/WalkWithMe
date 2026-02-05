import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import {
    Calendar,
    CalendarCheck,
    CalendarClock,
    Clock,
    History,
    Loader2,
    Mail,
    MapPin,
    Plus,
    Trash2,
    Users,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { CreateMeetingModal } from '../../components/dashboard/CreateMeetingModal'
import {
    EmptyState,
    GlassCard,
} from '../../components/dashboard/DashboardWidgets'
import { MeetingInvitationCard } from '../../components/dashboard/MeetingInvitationCard'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

type TabType = 'upcoming' | 'past' | 'invitations'

export const Route = createFileRoute('/dashboard/meetings/')({
  component: MeetingsIndexPage,
})

function MeetingsIndexPage() {
  const { t } = useTranslation()
  const user = useQuery(api.users.current)
  const upcomingMeetings = useQuery(api.meetings.listUpcoming)
  const pastMeetings = useQuery(api.meetings.listPast)
  const receivedInvitations = useQuery(api.meetingInvitations.listReceived)
  const [activeTab, setActiveTab] = useState<TabType>('upcoming')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const deleteMeeting = useMutation(api.meetings.remove)

  // Loading state
  if (
    user === undefined ||
    upcomingMeetings === undefined ||
    pastMeetings === undefined ||
    receivedInvitations === undefined
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (user === null) {
    return null
  }

  const tabs: Array<{
    id: TabType
    label: string
    icon: typeof Calendar
    count?: number
  }> = [
    {
      id: 'upcoming',
      label: t('meetings.tabUpcoming'),
      icon: CalendarClock,
      count: upcomingMeetings.length,
    },
    {
      id: 'past',
      label: t('meetings.tabPast'),
      icon: History,
      count: pastMeetings.length,
    },
    {
      id: 'invitations',
      label: t('meetings.tabInvitations'),
      icon: Mail,
      count: receivedInvitations.length,
    },
  ]

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

  const handleDelete = async (meetingId: Id<'meetings'>) => {
    if (
      confirm(
        t(
          'meetings.deleteConfirm',
          'Are you sure you want to delete this meeting?',
        ),
      )
    ) {
      await deleteMeeting({ meetingId })
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-primary" />
              {t('meetings.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('meetings.subtitle')}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-primary text-primary-foreground font-medium
              hover:bg-primary/90 transition-colors cursor-pointer
              shadow-lg shadow-primary/25"
          >
            <Plus className="w-5 h-5" />
            {t('meetings.createMeeting')}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
                transition-all duration-200 cursor-pointer
                ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }
                  ${tab.id === 'invitations' && tab.count > 0 ? 'bg-primary text-primary-foreground' : ''}
                `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {upcomingMeetings.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMeetings.map((meeting) => {
                  const { date, time } = formatDateTime(meeting.dateTime)
                  return (
                    <GlassCard key={meeting._id} className="relative group">
                      {/* Owner badge */}
                      {meeting.isOwner && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                          {t('meetings.organizer', 'Organizer')}
                        </span>
                      )}

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {meeting.title}
                          </h3>
                          {meeting.owner && (
                            <p className="text-sm text-muted-foreground">
                              {t('meetings.by', 'by')} {meeting.owner.name}
                            </p>
                          )}
                        </div>

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
                              <span className="line-clamp-1">
                                {meeting.location.address}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {t('meetings.participants', {
                                count: meeting.participantCount,
                              })}
                            </span>
                          </div>
                          <MeetingWeather
                            lat={meeting.location.lat}
                            lng={meeting.location.lng}
                            dateTime={meeting.dateTime}
                            compact
                            className="pt-1"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Link
                            to="/dashboard/meetings/$meetingId"
                            params={{ meetingId: meeting._id }}
                            className="flex-1 text-center py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
                          >
                            {t('meetings.viewDetails', 'View Details')}
                          </Link>
                          {meeting.isOwner && (
                            <button
                              onClick={() => handleDelete(meeting._id)}
                              className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            ) : (
              <GlassCard hover={false} className="py-12">
                <EmptyState
                  icon={CalendarClock}
                  title={t('meetings.noMeetings')}
                  description={t('meetings.noMeetingsDesc')}
                  action={
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      {t('meetings.createMeeting')}
                    </button>
                  }
                />
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'past' && (
          <div className="space-y-4">
            {pastMeetings.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastMeetings.map((meeting) => {
                  const { date, time } = formatDateTime(meeting.dateTime)
                  return (
                    <GlassCard key={meeting._id} className="opacity-75">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">
                            {meeting.title}
                          </h3>
                          {meeting.owner && (
                            <p className="text-sm text-muted-foreground">
                              {t('meetings.by', 'by')} {meeting.owner.name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>
                              {t('meetings.attended', {
                                count: meeting.participantCount,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )
                })}
              </div>
            ) : (
              <GlassCard hover={false} className="py-12">
                <EmptyState
                  icon={History}
                  title={t('meetings.noPastMeetings')}
                  description={t('meetings.noPastMeetingsDesc')}
                />
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'invitations' && (
          <div className="space-y-4">
            {receivedInvitations.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {receivedInvitations.map((invitation) => (
                  <MeetingInvitationCard
                    key={invitation._id}
                    invitation={invitation}
                  />
                ))}
              </div>
            ) : (
              <GlassCard hover={false} className="py-12">
                <EmptyState
                  icon={Mail}
                  title={t('meetings.noInvitations')}
                  description={t('meetings.noInvitationsDesc')}
                />
              </GlassCard>
            )}
          </div>
        )}

        {/* Stats Summary */}
        <GlassCard hover={false}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('meetings.tabUpcoming')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {upcomingMeetings.length}
                </p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('meetings.tabPast')}
                </p>
                <p className="text-2xl font-bold">{pastMeetings.length}</p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('meetings.tabInvitations')}
                </p>
                <p className="text-2xl font-bold">
                  {receivedInvitations.length}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal onClose={() => setShowCreateModal(false)} />
      )}
    </DashboardLayout>
  )
}
