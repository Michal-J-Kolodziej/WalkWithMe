import { useMutation } from 'convex/react'
import { Loader2, PawPrint, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/Button'
import type { Id } from '../../../convex/_generated/dataModel'

interface DogData {
  _id: Id<'dogs'>
  name: string
  breed: string
  age: number
  bio: string
  imageUrl: string
  imageUrls?: Array<string>
  createdAt: number
}

interface DogCardProps {
  dog: DogData
  onEdit?: (dog: DogData) => void
}

export function DogCard({ dog, onEdit }: DogCardProps) {
  const { t } = useTranslation()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const removeDog = useMutation(api.dogs.remove)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await removeDog({ id: dog._id })
    } catch (error) {
      console.error('Failed to delete dog:', error)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] relative group">
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-4">
          <p className="text-center font-medium mb-4">
            {t('dogs.deleteConfirm', { name: dog.name })}
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="cursor-pointer"
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2 cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {t('common.delete')}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Dog Avatar */}
        <div className="flex flex-col gap-2">
          {/* Main Dog Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden group/image relative">
            <img
              src={dog.imageUrl}
              alt={dog.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {dog.imageUrls && dog.imageUrls.length > 0 && (
            <div className="flex gap-1">
              {dog.imageUrls.slice(0, 3).map((url, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-md overflow-hidden bg-muted"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {dog.imageUrls.length > 3 && (
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                  +{dog.imageUrls.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg truncate">{dog.name}</h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <PawPrint className="w-3 h-3" />
              {t('dogs.ageYears', { count: dog.age })}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{dog.breed}</p>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {dog.bio}
          </p>
        </div>
      </div>

      {/* Action Buttons - shown on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {onEdit && (
          <button
            onClick={() => onEdit(dog)}
            className="p-2 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title={t('common.edit')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        )}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors cursor-pointer"
          title={t('common.delete')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
