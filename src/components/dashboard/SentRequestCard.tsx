import { useMutation } from 'convex/react'
import { Loader2, MapPin, User, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/Button'
import type { Id } from '../../../convex/_generated/dataModel'

interface SentRequest {
  _id: Id<'friendRequests'>
  toUserId: Id<'users'>
  message?: string
  createdAt: number
  toUser: {
    _id: Id<'users'>
    name?: string
    image?: string
    bio?: string
    location?: string
  } | null
}

interface SentRequestCardProps {
  request: SentRequest
}

export function SentRequestCard({ request }: SentRequestCardProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const cancelRequest = useMutation(api.friendRequests.cancel)

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await cancelRequest({ requestId: request._id })
    } catch (error) {
      console.error('Failed to cancel request:', error)
      setIsCancelling(false)
      setShowConfirm(false)
    }
  }

  const timeAgo = getTimeAgo(request.createdAt)

  if (!request.toUser) {
    return null
  }

  return (
    <div className="glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] relative">
      {/* Cancel Confirmation Overlay */}
      {showConfirm && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-4">
          <p className="text-center font-medium mb-4">
            Cancel request to{' '}
            <span className="text-primary">
              {request.toUser.name || 'this user'}
            </span>
            ?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirm(false)}
              disabled={isCancelling}
              className="cursor-pointer"
            >
              Keep
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
              className="gap-2 cursor-pointer"
            >
              {isCancelling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Cancel Request
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {request.toUser.image ? (
            <img
              src={request.toUser.image}
              alt={request.toUser.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg truncate">
              {request.toUser.name || 'Unknown User'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium">
                Pending
              </span>
            </div>
          </div>

          {request.toUser.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{request.toUser.location}</span>
            </div>
          )}

          {request.message && (
            <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">
                Your message:
              </p>
              <p className="text-sm text-foreground italic">
                "{request.message}"
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">
              Sent {timeAgo}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirm(true)}
              className="gap-2 cursor-pointer text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
