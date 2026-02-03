import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { ArrowLeft, Loader2, MapPin, Send, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../../components/ui/Button'
import { ChatEmptyState } from './chat'
import type { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/dashboard/chat/$conversationId')({
  component: ConversationPage,
})

function ConversationPage() {
  const { conversationId } = Route.useParams()
  const navigate = useNavigate()

  const conversation = useQuery(api.conversations.get, {
    conversationId: conversationId as Id<'conversations'>,
  })
  const messages = useQuery(api.messages.list, {
    conversationId: conversationId as Id<'conversations'>,
  })
  const sendMessage = useMutation(api.messages.send)
  const markAsRead = useMutation(api.messages.markAsRead)

  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (conversation) {
      markAsRead({ conversationId: conversationId as Id<'conversations'> })
    }
  }, [conversation, conversationId, markAsRead])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [conversationId])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const text = messageText.trim()
    if (!text || isSending) return

    setIsSending(true)
    setMessageText('')

    try {
      await sendMessage({
        conversationId: conversationId as Id<'conversations'>,
        text,
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessageText(text) // Restore text on error
    } finally {
      setIsSending(false)
      inputRef.current?.focus()
    }
  }

  // Loading state
  if (conversation === undefined || messages === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Invalid conversation
  if (conversation === null) {
    return <ChatEmptyState />
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border/50">
        {/* Back button for mobile */}
        <Link
          to="/dashboard/chat"
          className="md:hidden p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Friend Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {conversation.friend?.image ? (
            <img
              src={conversation.friend.image}
              alt={conversation.friend.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>

        {/* Friend Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">
            {conversation.friend?.name || 'Unknown User'}
          </h2>
          {conversation.friend?.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{conversation.friend.location}</span>
            </div>
          )}
        </div>

        {/* View Profile Link */}
        <Link
          to="/dashboard/friends"
          className="text-xs text-primary hover:underline hidden sm:block"
        >
          View Profile
        </Link>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          <>
            {messages.map((message, index) => {
              const showAvatar =
                !message.isOwn && (index === 0 || messages[index - 1].isOwn)

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  showAvatar={showAvatar}
                  friendImage={conversation.friend?.image}
                  friendName={conversation.friend?.name}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Start the conversation</h3>
            <p className="text-sm text-muted-foreground">
              Send a message to {conversation.friend?.name || 'your friend'}!
            </p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            disabled={isSending}
            className="flex-1 px-4 py-3 rounded-xl bg-muted/50 border border-border/50
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
              transition-all disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!messageText.trim() || isSending}
            className="px-4 gap-2 cursor-pointer"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </form>
    </div>
  )
}

interface MessageBubbleProps {
  message: {
    _id: Id<'messages'>
    text: string
    createdAt: number
    isOwn: boolean
  }
  showAvatar: boolean
  friendImage?: string
  friendName?: string
}

function MessageBubble({
  message,
  showAvatar,
  friendImage,
  friendName,
}: MessageBubbleProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={`flex items-end gap-2 ${message.isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar for received messages */}
      {!message.isOwn && (
        <div
          className={`w-8 h-8 rounded-full flex-shrink-0 ${showAvatar ? '' : 'invisible'}`}
        >
          {showAvatar && (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
              {friendImage ? (
                <img
                  src={friendImage}
                  alt={friendName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`
          max-w-[75%] px-4 py-2.5 rounded-2xl
          ${
            message.isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          }
        `}
      >
        <p className="break-words">{message.text}</p>
        <p
          className={`text-xs mt-1 ${
            message.isOwn
              ? 'text-primary-foreground/70'
              : 'text-muted-foreground'
          }`}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
