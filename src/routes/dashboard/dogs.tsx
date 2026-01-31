import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { Dog, Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { EmptyState, GlassCard } from '../../components/dashboard/DashboardWidgets'
import { DogCard } from '../../components/dashboard/DogCard'
import { DogForm } from '../../components/dashboard/DogForm'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'
import { Button } from '../../components/ui/Button'

// Type for dog data used in edit flow
interface DogData {
  _id: Id<"dogs">
  name: string
  breed: string
  age: number
  bio: string
  imageUrl: string
  imageUrls?: string[]
  createdAt: number
}

export const Route = createFileRoute('/dashboard/dogs')({
  component: DogsPage,
})

function DogsPage() {
  const { t } = useTranslation()
  const user = useQuery(api.users.current)
  const dogs = useQuery(api.dogs.listByOwner)
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [editingDog, setEditingDog] = useState<DogData | null>(null)

  // Loading state
  if (user === undefined || dogs === undefined) {
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

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Dog className="w-8 h-8 text-primary" />
              {t('dogs.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('dogs.subtitle')}
            </p>
          </div>
          <Button 
            className="gap-2 cursor-pointer" 
            onClick={() => setIsAddFormOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t('dogs.addNewDog')}
          </Button>
        </div>

        {/* Dogs Grid */}
        {dogs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => (
              <DogCard 
                key={dog._id} 
                dog={dog} 
                onEdit={(d) => setEditingDog(d)}
              />
            ))}
          </div>
        ) : (
          <GlassCard hover={false} className="py-12">
            <EmptyState
              icon={Dog}
              title={t('dogs.noDogs')}
              description={t('dogs.noDogsDesc')}
              action={
                <Button 
                  className="gap-2 cursor-pointer"
                  onClick={() => setIsAddFormOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  {t('dashboard.addFirstDog')}
                </Button>
              }
            />
          </GlassCard>
        )}

        {/* Stats Card */}
        {dogs.length > 0 && (
          <GlassCard hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('dashboard.statsMyDogs')}</p>
                <p className="text-3xl font-bold text-primary">{dogs.length}</p>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10">
                <Dog className="w-8 h-8 text-primary" />
              </div>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Add Dog Modal */}
      <DogForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        mode="add"
      />

      {/* Edit Dog Modal */}
      <DogForm
        isOpen={!!editingDog}
        onClose={() => setEditingDog(null)}
        dog={editingDog}
        mode="edit"
      />
    </DashboardLayout>
  )
}
