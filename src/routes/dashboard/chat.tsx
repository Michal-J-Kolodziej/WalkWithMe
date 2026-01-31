import { createFileRoute, Link, Outlet, useParams } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import {
  Loader2,
  MessageCircle,
  MessageSquare,
  Search,
  User
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'

export const Route = createFileRoute('/dashboard/chat')({
  component: ChatPage,
})

function ChatPage() {
  const { t, i18n } = useTranslation()
  const user = useQuery(api.users.current)
  const conversations = useQuery(api.conversations.list)
  const [searchQuery, setSearchQuery] = useState('')

  // Loading state
  if (user === undefined || conversations === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (user === null) {
    return null
  }

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) =>
    conv.friend?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout user={user}>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            {t('chat.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('chat.subtitle')}
          </p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Conversation List Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0 flex flex-col glass-card rounded-2xl overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                    transition-all text-sm"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {filteredConversations.map((conv) => (
                    <ConversationItem
                      key={conv._id}
                      conversation={conv}
                    />
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">{t('common.noResults')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">{t('chat.noConversations')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('chat.noConversationsDesc')}
                  </p>
                  <Link
                    to="/dashboard/friends"
                    className="text-sm text-primary hover:underline"
                  >
                    {t('friends.title')} →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Chat Window Area - Shows Outlet or Empty State */}
          <div className="hidden md:flex flex-1 glass-card rounded-2xl overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

interface ConversationItemProps {
  conversation: {
    _id: Id<"conversations">
    friend: {
      _id: Id<"users">
      name?: string
      image?: string
    } | null
    lastMessage: {
      text: string
      senderId: Id<"users">
      createdAt: number
    } | null
    unreadCount: number
  }
}

function ConversationItem({ conversation }: ConversationItemProps) {
  const { i18n } = useTranslation()
  const params = useParams({ strict: false })
  const currentConversationId = (params as { conversationId?: string })?.conversationId
  const isActive = currentConversationId === conversation._id

  const formatTime = (timestamp: number) => {
    const now = new Date()
    const date = new Date(timestamp)
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    const locale = i18n.language === 'pl' ? 'pl-PL' : 'en-US'

    if (diffDays === 0) {
      return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' })
    } else if (diffDays === 1) {
      return i18n.language === 'pl' ? 'Wczoraj' : 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString(locale, { weekday: 'short' })
    } else {
      return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
    }
  }

  return (
    <Link
      to="/dashboard/chat/$conversationId"
      params={{ conversationId: conversation._id }}
      className={`
        flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer
        ${isActive ? 'bg-primary/10' : ''}
      `}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
        {conversation.friend?.image ? (
          <img
            src={conversation.friend.image}
            alt={conversation.friend.name || 'User'}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-6 h-6 text-primary" />
        )}
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-semibold">
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium truncate ${conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
            {conversation.friend?.name || 'Unknown User'}
          </span>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        {conversation.lastMessage ? (
          <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
            {conversation.lastMessage.text}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {/* No messages yet */}
          </p>
        )}
      </div>
    </Link>
  )
}

// Empty state for when no conversation is selected
export function ChatEmptyState() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageSquare className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{t('chat.title')}</h3>
      <p className="text-muted-foreground max-w-sm">
        {t('chat.subtitle')}
      </p>
    </div>
  )
}
