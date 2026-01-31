import { useMutation } from 'convex/react'
import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '../ui/Button'

interface SendRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  toUser: {
    _id: Id<"users">
    name?: string
    image?: string
    location?: string
  }
}

export function SendRequestModal({ isOpen, onClose, onSuccess, toUser }: SendRequestModalProps) {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sendRequest = useMutation(api.friendRequests.send)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await sendRequest({
        toUserId: toUser._id,
        message: message.trim() || undefined,
      })
      onSuccess?.()
      onClose()
      setMessage('')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send request'
      setError(errorMessage)
      console.error('Failed to send friend request:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setMessage('')
      setError(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">Send Friend Request</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Connect with <span className="text-foreground font-medium">{toUser.name || 'this user'}</span>
            {toUser.location && <span> from {toUser.location}</span>}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Message (Optional) */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Add a message <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd love to connect and maybe arrange a dog walk together..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
