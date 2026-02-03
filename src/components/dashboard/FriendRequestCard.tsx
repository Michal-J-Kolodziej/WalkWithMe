import { useMutation } from 'convex/react'
import { Check, Loader2, MapPin, User, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/Button'
import { RejectRequestModal } from './RejectRequestModal'
import type { Id } from '../../../convex/_generated/dataModel'

interface FriendRequest {
  _id: Id<'friendRequests'>
  fromUserId: Id<'users'>
  message?: string
  createdAt: number
  fromUser: {
    _id: Id<'users'>
    name?: string
    image?: string
    bio?: string
    location?: string
  } | null
}

interface FriendRequestCardProps {
  request: FriendRequest
}

export function FriendRequestCard({ request }: FriendRequestCardProps) {
  const [isAccepting, setIsAccepting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const acceptRequest = useMutation(api.friendRequests.accept)

  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await acceptRequest({ requestId: request._id })
    } catch (error) {
      console.error('Failed to accept request:', error)
      setIsAccepting(false)
    }
  }

  const timeAgo = getTimeAgo(request.createdAt)

  if (!request.fromUser) {
    return null
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {request.fromUser.image ? (
              <img
                src={request.fromUser.image}
                alt={request.fromUser.name || 'User'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 text-primary" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-lg truncate">
                {request.fromUser.name || 'Unknown User'}
              </h3>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo}
              </span>
            </div>

            {request.fromUser.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{request.fromUser.location}</span>
              </div>
            )}

            {request.message && (
              <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <p className="text-sm text-foreground italic">
                  "{request.message}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isAccepting}
                className="gap-2 cursor-pointer flex-1"
              >
                {isAccepting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRejectModal(true)}
                className="gap-2 cursor-pointer flex-1"
              >
                <X className="w-4 h-4" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RejectRequestModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        requestId={request._id}
        userName={request.fromUser.name}
      />
    </>
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
