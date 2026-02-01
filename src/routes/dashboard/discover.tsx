import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Compass, Loader2, SearchX, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import { EmptyState, GlassCard } from '../../components/dashboard/DashboardWidgets'
import { UserCard } from '../../components/dashboard/UserCard'
import { UserSearchBar } from '../../components/dashboard/UserSearchBar'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

export const Route = createFileRoute('/dashboard/discover')({
  component: DiscoverPage,
})

function DiscoverPage() {
  const { t } = useTranslation()
  const user = useQuery(api.users.current)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Use different queries based on search mode
  const allUsers = useQuery(api.discover.listUsers, { limit: 50 })
  const searchResults = useQuery(
    api.discover.searchUsers,
    isSearchMode && searchTerm ? { searchTerm, limit: 50 } : "skip"
  )

  const users = isSearchMode ? searchResults : allUsers

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

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setIsSearchMode(true)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setIsSearchMode(false)
  }

  const isLoading = users === undefined

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Compass className="w-8 h-8 text-primary" />
              {t('discover.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('discover.subtitle')}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <UserSearchBar 
          onSearch={handleSearch}
          onClear={handleClearSearch}
          isSearching={isSearchMode}
        />

        {/* Search Results Info */}
        {isSearchMode && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {isLoading ? t('common.loading') : `${users?.length ?? 0} ${t('common.noResults').toLowerCase().includes('no') ? '' : ''}`}
            </span>
          </div>
        )}

        {/* Users Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <GlassCard key={i} hover={false} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-32" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="h-4 bg-muted rounded w-20 mb-2" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded w-24" />
                    <div className="h-8 bg-muted rounded w-24" />
                  </div>
                </div>
                <div className="h-9 bg-muted rounded mt-4" />
              </GlassCard>
            ))}
          </div>
        ) : users && users.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((discoverUser) => (
              <UserCard 
                key={discoverUser._id} 
                user={discoverUser} 
                currentLocation={user.geo_location}
              />
            ))}
          </div>
        ) : isSearchMode ? (
          <GlassCard hover={false} className="py-12">
            <EmptyState
              icon={SearchX}
              title={t('discover.noUsers')}
              description={t('discover.noUsersDesc')}
            />
          </GlassCard>
        ) : (
          <GlassCard hover={false} className="py-12">
            <EmptyState
              icon={Users}
              title={t('discover.noUsers')}
              description={t('discover.noUsersDesc')}
            />
          </GlassCard>
        )}

        {/* Stats */}
        {!isLoading && users && users.length > 0 && (
          <GlassCard hover={false}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('discover.title')}
                </p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  )
}
