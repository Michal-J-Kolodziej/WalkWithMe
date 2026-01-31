import { useMutation, useQuery } from 'convex/react'
import { Check, Loader2, Search, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'

interface InviteFriendsModalProps {
  meetingId: Id<'meetings'>
  onClose: () => void
}

export function InviteFriendsModal({ meetingId, onClose }: InviteFriendsModalProps) {
  const invitableFriends = useQuery(api.meetingInvitations.getInvitableFriends, {
    meetingId,
  })
  const inviteFriend = useMutation(api.meetingInvitations.invite)

  const [searchQuery, setSearchQuery] = useState('')
  const [invitingIds, setInvitingIds] = useState<Set<Id<'users'>>>(new Set())
  const [invitedIds, setInvitedIds] = useState<Set<Id<'users'>>>(new Set())
  const [error, setError] = useState('')

  const handleInvite = async (userId: Id<'users'>) => {
    setInvitingIds((prev) => new Set(prev).add(userId))
    setError('')

    try {
      await inviteFriend({
        meetingId,
        toUserId: userId,
      })
      setInvitedIds((prev) => new Set(prev).add(userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setInvitingIds((prev) => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  const filteredFriends = invitableFriends?.filter((friend) =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Friends
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border
              focus:outline-none focus:ring-2 focus:ring-primary/50
              placeholder:text-muted-foreground"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-4">
            {error}
          </p>
        )}

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {invitableFriends === undefined ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFriends && filteredFriends.length > 0 ? (
            <div className="space-y-2">
              {filteredFriends.map((friend) => {
                const isInviting = invitingIds.has(friend._id)
                const isInvited = invitedIds.has(friend._id)

                return (
                  <div
                    key={friend._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {friend.image ? (
                        <img
                          src={friend.image}
                          alt={friend.name || ''}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-medium">
                          {friend.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{friend.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">
                        {friend.dogCount} dog{friend.dogCount !== 1 ? 's' : ''}
                        {friend.location && ` • ${friend.location}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleInvite(friend._id)}
                      disabled={isInviting || isInvited}
                      className={`
                        px-3 py-1.5 rounded-lg font-medium text-sm
                        transition-colors cursor-pointer
                        ${isInvited
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isInviting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isInvited ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          Invited
                        </span>
                      ) : (
                        'Invite'
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No friends match your search'
                  : 'All your friends have already been invited!'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-border
              font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
