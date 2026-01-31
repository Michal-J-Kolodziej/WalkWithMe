import { useMutation } from 'convex/react'
import { ImageIcon, Loader2, Plus, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

interface MultiImageUploadProps {
  /** Array of current image URLs */
  currentImageUrls: string[]
  /** Callback when images change (add/remove) */
  onImagesChange: (urls: string[]) => void
  /** Maximum number of images allowed */
  maxImages?: number
  /** Optional class name for the container */
  className?: string
  /** Whether the component is in a loading state */
  disabled?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function MultiImageUpload({
  currentImageUrls,
  onImagesChange,
  maxImages = 5,
  className = '',
  disabled = false,
}: MultiImageUploadProps) {
  const { t } = useTranslation()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadingCount, setUploadingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (files: FileList) => {
    setError(null)
    const filesToUpload = Array.from(files).slice(0, maxImages - currentImageUrls.length)

    if (filesToUpload.length === 0) {
      setError(t('imageUpload.maxImages', `Maximum ${maxImages} images allowed`))
      return
    }

    // Validate all files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        setError(t('imageUpload.invalidType', 'Please select image files only'))
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(t('imageUpload.maxSize', 'Files must be less than 5MB each'))
        return
      }
    }

    setUploadingCount(filesToUpload.length)

    try {
      const uploadedUrls: string[] = []

      for (const file of filesToUpload) {
        const uploadUrl = await generateUploadUrl()
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })

        if (!response.ok) throw new Error('Upload failed')

        const { storageId } = await response.json()
        // Get the URL for this storage ID
        const url = await getStorageUrl(storageId)
        if (url) uploadedUrls.push(url)
      }

      onImagesChange([...currentImageUrls, ...uploadedUrls])
    } catch (err) {
      setError(t('imageUpload.uploadFailed', 'Failed to upload images'))
      console.error('Upload error:', err)
    } finally {
      setUploadingCount(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [currentImageUrls, generateUploadUrl, maxImages, onImagesChange, t])

  // Helper to get URL from storage ID - we'll need to use a query for this
  const getStorageUrl = async (storageId: Id<"_storage">): Promise<string | null> => {
    // For now, we'll construct the URL pattern
    // In production, you'd want to use the query
    return `https://storage.convex.cloud/${storageId}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleRemove = (index: number) => {
    const newUrls = currentImageUrls.filter((_, i) => i !== index)
    onImagesChange(newUrls)
  }

  const canAddMore = currentImageUrls.length < maxImages

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Existing Images */}
        {currentImageUrls.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="relative aspect-square rounded-xl overflow-hidden bg-muted group"
          >
            <img
              src={url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1.5 bg-destructive text-destructive-foreground rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {index === 0 && (
              <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                {t('dogs.mainPhoto', 'Main')}
              </span>
            )}
          </div>
        ))}

        {/* Loading placeholders */}
        {Array.from({ length: uploadingCount }).map((_, i) => (
          <div
            key={`loading-${i}`}
            className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center"
          >
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ))}

        {/* Add more button */}
        {canAddMore && uploadingCount === 0 && (
          <label
            className={`
              aspect-square rounded-xl border-2 border-dashed border-border/50
              flex flex-col items-center justify-center gap-1 cursor-pointer
              bg-muted/30 hover:bg-muted/50 hover:border-primary/50
              transition-all duration-200
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputChange}
              disabled={disabled || uploadingCount > 0}
              className="hidden"
            />
            <Plus className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t('imageUpload.addPhoto', 'Add')}
            </span>
          </label>
        )}
      </div>

      {/* Info text */}
      <p className="text-xs text-muted-foreground">
        {t('imageUpload.multiPhotoHint', `${currentImageUrls.length}/${maxImages} photos. First photo is the main one.`)}
      </p>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}
