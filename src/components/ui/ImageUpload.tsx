import { useMutation } from 'convex/react'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

interface ImageUploadProps {
  /** Current image URL (from storage or external) */
  currentImageUrl?: string
  /** Callback when a new image is uploaded, returns the storage ID */
  onUpload: (storageId: Id<"_storage">) => void
  /** Callback when the image is removed */
  onRemove?: () => void
  /** Optional class name for the container */
  className?: string
  /** Whether the component is in a loading state */
  disabled?: boolean
  /** Shape of the preview - 'circle' for profile pics, 'square' for dog photos */
  shape?: 'circle' | 'square'
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function ImageUpload({
  currentImageUrl,
  onUpload,
  onRemove,
  className = '',
  disabled = false,
  shape = 'circle',
}: ImageUploadProps) {
  const { t } = useTranslation()
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(t('imageUpload.invalidType', 'Please select an image file'))
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(t('imageUpload.maxSize', 'File must be less than 5MB'))
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setIsUploading(true)

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl()

      // Upload the file
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { storageId } = await response.json()
      onUpload(storageId as Id<"_storage">)
    } catch (err) {
      setError(t('imageUpload.uploadFailed', 'Failed to upload image'))
      setPreviewUrl(null)
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [generateUploadUrl, onUpload, t])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }, [handleFileSelect])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onRemove?.()
  }

  const displayUrl = previewUrl || currentImageUrl
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative group cursor-pointer
          ${shapeClass}
          ${displayUrl ? 'w-24 h-24' : 'w-full p-6'}
          ${isDragOver ? 'ring-2 ring-primary ring-offset-2' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          transition-all duration-200
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {displayUrl ? (
          // Preview mode
          <div className={`relative w-full h-full ${shapeClass} overflow-hidden bg-muted`}>
            <img
              src={displayUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => setError(t('imageUpload.loadError', 'Failed to load image'))}
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
            {!isUploading && onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full
                  opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          // Empty state / drop zone
          <div className={`
            flex flex-col items-center justify-center gap-3
            border-2 border-dashed border-border/50 rounded-xl
            bg-muted/30 hover:bg-muted/50 hover:border-primary/50
            transition-all duration-200 py-6
            ${isDragOver ? 'border-primary bg-primary/5' : ''}
          `}>
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <div className="p-3 rounded-full bg-primary/10">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    {t('imageUpload.dragDrop', 'Drag and drop or click to upload')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('imageUpload.formats', 'PNG, JPG, GIF up to 5MB')}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

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
