import { useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { Loader2, MapPin, MessageSquare, User, UserMinus, X } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { calculateDistance } from '../../lib/geo'
import { Button } from '../ui/Button'

interface FriendData {
  friendshipId: Id<"friendships">
  friendSince: number
  friend: {
    _id: Id<"users">
    name?: string
    image?: string
    bio?: string
    location?: string
    geo_location?: { latitude: number; longitude: number; updatedAt: number }
    email?: string
  }
  dogsCount: number
}

interface FriendCardProps {
  data: FriendData
  currentLocation?: { latitude: number; longitude: number } | null
}

export function FriendCard({ data, currentLocation }: FriendCardProps) {
  const navigate = useNavigate()
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)
  const removeFriend = useMutation(api.friendships.remove)
  const getOrCreateConversation = useMutation(api.conversations.getOrCreate)

  const handleUnfriend = async () => {
    setIsLoading(true)
    try {
      await removeFriend({ friendshipId: data.friendshipId })
    } catch (error) {
      console.error('Failed to unfriend:', error)
      setIsLoading(false)
      setShowUnfriendConfirm(false)
    }
  }

  const handleStartChat = async () => {
    setIsStartingChat(true)
    try {
      const conversationId = await getOrCreateConversation({ friendId: data.friend._id })
      navigate({
        to: '/dashboard/chat/$conversationId',
        params: { conversationId },
      })
    } catch (error) {
      console.error('Failed to start chat:', error)
      setIsStartingChat(false)
    }
  }

  const friendSinceDate = new Date(data.friendSince).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] relative group">
      {/* Unfriend Confirmation Overlay */}
      {showUnfriendConfirm && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-4">
          <p className="text-center font-medium mb-4">
            Unfriend <span className="text-primary">{data.friend.name || 'this user'}</span>?
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUnfriendConfirm(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnfriend}
              disabled={isLoading}
              className="gap-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserMinus className="w-4 h-4" />
              )}
              Unfriend
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {data.friend.image ? (
            <img 
              src={data.friend.image} 
              alt={data.friend.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg truncate">{data.friend.name || 'Unknown User'}</h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Since {friendSinceDate}
            </span>
          </div>
          
          {data.friend.location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {data.friend.location}
                {currentLocation && data.friend.geo_location && (
                  <span className="ml-1">
                    ({calculateDistance(
                      currentLocation.latitude,
                      currentLocation.longitude,
                      data.friend.geo_location.latitude,
                      data.friend.geo_location.longitude
                    ).formatted} away)
                  </span>
                )}
              </span>
            </div>
          )}
          
          {data.friend.bio && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {data.friend.bio}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              🐕 {data.dogsCount} {data.dogsCount === 1 ? 'dog' : 'dogs'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons - shown on hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={handleStartChat}
          disabled={isStartingChat}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer disabled:opacity-50"
          title="Send Message"
        >
          {isStartingChat ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => setShowUnfriendConfirm(true)}
          className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors cursor-pointer"
          title="Unfriend"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

