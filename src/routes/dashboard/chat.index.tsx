import { createFileRoute } from '@tanstack/react-router'
import { ChatEmptyState } from './chat'

export const Route = createFileRoute('/dashboard/chat/')({
  component: ChatIndexPage,
})

function ChatIndexPage() {
  return <ChatEmptyState />
}
