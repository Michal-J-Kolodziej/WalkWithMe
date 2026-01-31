import { Link } from '@tanstack/react-router'
import { Clock, Dog, MapPin, MessageSquare, User, UserPlus } from 'lucide-react'
import { useState } from 'react'
import type { Id } from '../../../convex/_generated/dataModel'
import { Button } from '../ui/Button'
import { SendRequestModal } from './SendRequestModal'

interface UserDog {
  _id: Id<"dogs">
  name: string
  breed: string
  imageUrl: string
}

interface DiscoverableUser {
  _id: Id<"users">
  name?: string
  image?: string
  bio?: string
  location?: string
  status: "none" | "pending_sent" | "pending_received"
  requestId?: string
  dogs: UserDog[]
}

interface UserCardProps {
  user: DiscoverableUser
}

export function UserCard({ user }: UserCardProps) {
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [localStatus, setLocalStatus] = useState(user.status)

  const handleRequestSent = () => {
    setLocalStatus("pending_sent")
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] group">
        <div className="flex flex-col h-full">
          {/* Header - Avatar and Basic Info */}
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{user.name || 'Dog Lover'}</h3>
              
              {user.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Dogs Preview */}
          {user.dogs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Dog className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {user.dogs.length} {user.dogs.length === 1 ? 'dog' : 'dogs'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.dogs.slice(0, 3).map((dog) => (
                  <div 
                    key={dog._id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs"
                  >
                    <div className="w-6 h-6 rounded-md overflow-hidden bg-primary/10 flex-shrink-0">
                      <img 
                        src={dog.imageUrl} 
                        alt={dog.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-medium truncate max-w-[80px]">{dog.name}</span>
                  </div>
                ))}
                {user.dogs.length > 3 && (
                  <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                    +{user.dogs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto pt-4">
            {localStatus === "none" && (
              <Button 
                onClick={() => setShowRequestModal(true)}
                className="w-full gap-2 cursor-pointer"
                size="sm"
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </Button>
            )}

            {localStatus === "pending_sent" && (
              <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-500/10 text-amber-500 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Request Pending
              </div>
            )}

            {localStatus === "pending_received" && (
              <Link to="/dashboard/friends">
                <Button 
                  variant="outline"
                  className="w-full gap-2 cursor-pointer"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Respond to Request
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <SendRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSuccess={handleRequestSent}
        toUser={user}
      />
    </>
  )
}
