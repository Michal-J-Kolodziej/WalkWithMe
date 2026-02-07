import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Flame, Footprints, History, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import { GlassCard } from '../../components/dashboard/DashboardWidgets'
import { WalkHeatmap } from '../../components/dashboard/walk/WalkHeatmap'
import { WalkHistoryList } from '../../components/dashboard/walk/WalkHistoryList'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

type TabType = 'history' | 'heatmap'

export const Route = createFileRoute('/dashboard/walks/')({
  component: WalksIndexPage,
})

function WalksIndexPage() {
  const { t } = useTranslation()
  const user = useQuery(api.users.current)
  const walkStats = useQuery(api.walks.getWalkStats)
  const [activeTab, setActiveTab] = useState<TabType>('history')

  // Loading state
  if (user === undefined) {
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
    icon: typeof History
  }> = [
    { id: 'history', label: t('walks.tabHistory'), icon: History },
    { id: 'heatmap', label: t('walks.tabHeatmap'), icon: Flame },
  ]

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`
    }
    return `${Math.round(meters)} m`
  }

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Footprints className="w-8 h-8 text-primary" />
              {t('walks.title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('walks.subtitle')}</p>
          </div>
        </div>

        {/* Weekly Stats Banner */}
        {walkStats && walkStats.weeklyDistanceMeters > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
            <p className="text-lg font-medium text-primary">
              🎉{' '}
              {t('walks.weeklyStats', {
                distance: formatDistance(walkStats.weeklyDistanceMeters),
              })}
            </p>
          </div>
        )}

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
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'history' && <WalkHistoryList />}

        {activeTab === 'heatmap' && (
          <div className="rounded-2xl overflow-hidden border border-border h-[500px]">
            <WalkHeatmap />
          </div>
        )}

        {/* Stats Summary */}
        {walkStats && (
          <GlassCard hover={false}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('walks.totalWalks', 'Total Walks')}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {walkStats.totalWalks}
                  </p>
                </div>
                <div className="h-10 w-px bg-border/50" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('walks.totalDistance', 'Total Distance')}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatDistance(walkStats.totalDistanceMeters)}
                  </p>
                </div>
                <div className="h-10 w-px bg-border/50" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t('walks.totalTime', 'Total Time')}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatDuration(walkStats.totalDurationMs)}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  )
}
