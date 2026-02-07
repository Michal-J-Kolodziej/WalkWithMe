import { useMutation } from 'convex/react'
import { Loader2, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/Button'
import type { Id } from '../../../convex/_generated/dataModel'

interface RejectRequestModalProps {
  isOpen: boolean
  onClose: () => void
  requestId: Id<'friendRequests'>
  userName?: string
}

export function RejectRequestModal({
  isOpen,
  onClose,
  requestId,
  userName,
}: RejectRequestModalProps) {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const rejectRequest = useMutation(api.friendRequests.reject)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await rejectRequest({
        requestId,
        reason: reason.trim() || undefined,
      })
      onClose()
      setReason('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to reject request'
      setError(message)
      console.error('Failed to reject request:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setReason('')
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
          <h2 className="text-xl font-bold">Reject Request</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Are you sure you want to reject the friend request from{' '}
            <span className="text-foreground font-medium">
              {userName || 'this user'}
            </span>
            ?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason (Optional) */}
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let them know why you're declining..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-background/50 border border-input transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-background resize-none text-sm"
            />
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
              variant="destructive"
              disabled={isLoading}
              className="flex-1 gap-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Reject
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
