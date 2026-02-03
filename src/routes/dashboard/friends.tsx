import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Inbox, Loader2, Send, UserCheck, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import {
  EmptyState,
  GlassCard,
} from '../../components/dashboard/DashboardWidgets'
import { FriendCard } from '../../components/dashboard/FriendCard'
import { FriendRequestCard } from '../../components/dashboard/FriendRequestCard'
import { SentRequestCard } from '../../components/dashboard/SentRequestCard'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

type TabType = 'friends' | 'requests' | 'sent'

export const Route = createFileRoute('/dashboard/friends')({
  component: FriendsPage,
})

function FriendsPage() {
  const { t } = useTranslation()
  const user = useQuery(api.users.current)
  const friends = useQuery(api.friendships.list)
  const receivedRequests = useQuery(api.friendRequests.listReceived)
  const sentRequests = useQuery(api.friendRequests.listSent)
  const [activeTab, setActiveTab] = useState<TabType>('friends')

  // Loading state
  if (
    user === undefined ||
    friends === undefined ||
    receivedRequests === undefined ||
    sentRequests === undefined
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
    labelKey: string
    icon: typeof Users
    count?: number
  }> = [
    {
      id: 'friends',
      labelKey: 'friends.tabFriends',
      icon: Users,
      count: friends.length,
    },
    {
      id: 'requests',
      labelKey: 'friends.tabRequests',
      icon: Inbox,
      count: receivedRequests.length,
    },
    {
      id: 'sent',
      labelKey: 'friends.tabSent',
      icon: Send,
      count: sentRequests.length,
    },
  ]

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-primary" />
            {t('friends.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('friends.subtitle')}</p>
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
              {t(tab.labelKey)}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
                  ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }
                  ${tab.id === 'requests' && tab.count > 0 ? 'bg-primary text-primary-foreground' : ''}
                `}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {friends.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.map((friendData) => (
                  <FriendCard
                    key={friendData.friendshipId}
                    data={friendData}
                    currentLocation={user.geo_location}
                  />
                ))}
              </div>
            ) : (
              <GlassCard hover={false} className="py-12">
                <EmptyState
                  icon={Users}
                  title={t('friends.noFriends')}
                  description={t('friends.noFriendsDesc')}
                />
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {receivedRequests.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {receivedRequests.map((request) => (
                  <FriendRequestCard key={request._id} request={request} />
                ))}
              </div>
            ) : (
              <GlassCard hover={false} className="py-12">
                <EmptyState
                  icon={Inbox}
                  title={t('friends.noRequests')}
                  description={t('friends.noRequestsDesc')}
                />
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {sentRequests.map((request) => (
                  <SentRequestCard key={request._id} request={request} />
                ))}
              </div>
            ) : (
              <GlassCard hover={false} className="py-12">
                <EmptyState
                  icon={Send}
                  title={t('friends.noSentRequests')}
                  description={t('friends.noSentRequestsDesc')}
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
                  {t('dashboard.statsFriends')}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {friends.length}
                </p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('friends.tabRequests')}
                </p>
                <p className="text-2xl font-bold">{receivedRequests.length}</p>
              </div>
              <div className="h-10 w-px bg-border/50" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('friends.tabSent')}
                </p>
                <p className="text-2xl font-bold">{sentRequests.length}</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  )
}
