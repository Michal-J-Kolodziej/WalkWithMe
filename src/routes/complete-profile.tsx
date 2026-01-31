import { createFileRoute } from '@tanstack/react-router'
import { CompleteProfileForm } from '../components/CompleteProfileForm'

export const Route = createFileRoute('/complete-profile')({
  component: CompleteProfilePage,
})

function CompleteProfilePage() {
  return <CompleteProfileForm />
}
