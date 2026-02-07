import { useMutation, useQuery } from 'convex/react'
import { Dog, Loader2, PawPrint, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/Button'
import { ImageUpload } from '../ui/ImageUpload'
import { MultiImageUpload } from '../ui/MultiImageUpload'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
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

interface DogFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  dog?: DogData | null // Pre-fill form when editing
  mode?: 'add' | 'edit'
}

export function DogForm({
  isOpen,
  onClose,
  onSuccess,
  dog,
  mode = 'add',
}: DogFormProps) {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [pendingStorageId, setPendingStorageId] =
    useState<Id<'_storage'> | null>(null)
  const [additionalPhotos, setAdditionalPhotos] = useState<Array<string>>([])

  const createDog = useMutation(api.dogs.create)
  const updateDog = useMutation(api.dogs.update)

  // Get URL for uploaded image
  const uploadedImageUrl = useQuery(
    api.files.getUrl,
    pendingStorageId ? { storageId: pendingStorageId } : 'skip',
  )

  // Reset form when modal opens/closes or dog changes
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setPendingStorageId(null)
      setAdditionalPhotos(dog?.imageUrls || [])
      setFormKey((prev) => prev + 1)
    }
  }, [isOpen, dog?._id])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get('name') as string
    const breed = formData.get('breed') as string
    const ageStr = formData.get('age') as string
    const bio = formData.get('bio') as string

    // Validate required fields
    if (!name || !breed || !ageStr || !bio) {
      setError(t('common.required'))
      setIsLoading(false)
      return
    }

    // For new dogs, require an image upload; for edits, use existing if no new upload
    const imageUrl =
      pendingStorageId && uploadedImageUrl
        ? uploadedImageUrl
        : dog?.imageUrl || ''

    if (!imageUrl && mode === 'add') {
      setError(t('dogs.photo') + ' ' + t('common.required').toLowerCase())
      setIsLoading(false)
      return
    }

    const age = parseInt(ageStr, 10)
    if (isNaN(age) || age < 0 || age > 30) {
      setError(t('common.error'))
      setIsLoading(false)
      return
    }

    try {
      if (mode === 'edit' && dog) {
        await updateDog({
          id: dog._id,
          name,
          breed,
          age,
          bio,
          imageUrl,
          imageUrls: additionalPhotos,
        })
      } else {
        await createDog({
          name,
          breed,
          age,
          bio,
          imageUrl,
          imageUrls: additionalPhotos,
        })
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : t('common.error')
      setError(message)
      console.error(`Failed to ${mode} dog:`, err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const isEdit = mode === 'edit'
  const title = isEdit ? t('dogs.editDogTitle') : t('dogs.addDogTitle')
  const buttonText = isEdit ? t('settings.saveChanges') : t('dogs.saveDog')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary">
            <PawPrint className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {title}
          </h2>
        </div>

        <form key={formKey} onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Breed Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 group">
              <Label
                htmlFor="name"
                className="text-sm font-medium ml-1 transition-colors group-focus-within:text-primary"
              >
                {t('dogs.name')} *
              </Label>
              <div className="relative">
                <Dog className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                <Input
                  id="name"
                  name="name"
                  placeholder={t('dogs.namePlaceholder')}
                  defaultValue={dog?.name || ''}
                  required
                  className="pl-10 h-12 rounded-xl bg-background/50 border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <Label
                htmlFor="breed"
                className="text-sm font-medium ml-1 transition-colors group-focus-within:text-primary"
              >
                {t('dogs.breed')} *
              </Label>
              <div className="relative">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
                <Input
                  id="breed"
                  name="breed"
                  placeholder={t('dogs.breedPlaceholder')}
                  defaultValue={dog?.breed || ''}
                  required
                  className="pl-10 h-12 rounded-xl bg-background/50 border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background"
                />
              </div>
            </div>
          </div>

          {/* Age */}
          <div className="space-y-2 group">
            <Label
              htmlFor="age"
              className="text-sm font-medium ml-1 transition-colors group-focus-within:text-primary"
            >
              {t('dogs.age')} *
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              min="0"
              max="30"
              placeholder={t('dogs.agePlaceholder')}
              defaultValue={dog?.age?.toString() || ''}
              required
              className="h-12 rounded-xl bg-background/50 border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2 group">
            <Label
              htmlFor="bio"
              className="text-sm font-medium ml-1 transition-colors group-focus-within:text-primary"
            >
              {t('dogs.bio')} *
            </Label>
            <textarea
              id="bio"
              name="bio"
              placeholder={t('dogs.bioPlaceholder')}
              rows={3}
              defaultValue={dog?.bio || ''}
              required
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background resize-none text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium ml-1">
              {t('dogs.photo')} {mode === 'add' && '*'}
            </Label>
            <ImageUpload
              currentImageUrl={
                pendingStorageId && uploadedImageUrl
                  ? uploadedImageUrl
                  : dog?.imageUrl
              }
              onUpload={(storageId) => setPendingStorageId(storageId)}
              onRemove={() => setPendingStorageId(null)}
              shape="square"
              disabled={isLoading}
            />
          </div>

          {/* Additional Photos */}
          <div className="space-y-2">
            <Label className="text-sm font-medium ml-1">
              {t('dogs.additionalPhotos')} ({t('common.optional')})
            </Label>
            <MultiImageUpload
              currentImageUrls={additionalPhotos}
              onImagesChange={setAdditionalPhotos}
              maxImages={4}
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-base rounded-xl group relative overflow-hidden cursor-pointer"
            size="lg"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <PawPrint className="w-5 h-5" />
                  {buttonText}
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </form>
      </div>
    </div>
  )
}

// Keep backward compatibility with old import name
export { DogForm as AddDogForm }
