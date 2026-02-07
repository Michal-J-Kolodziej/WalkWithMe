import { ConvexProviderWithAuthKit } from '@convex-dev/workos'
import { AuthKitProvider, useAuth } from '@workos-inc/authkit-react'
import { ConvexReactClient } from 'convex/react'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
const WORKOS_CLIENT_ID = (import.meta as any).env.VITE_WORKOS_CLIENT_ID
const WORKOS_REDIRECT_URI = (import.meta as any).env.VITE_WORKOS_REDIRECT_URI

if (!CONVEX_URL) {
  console.error('missing envar VITE_CONVEX_URL')
}
if (!WORKOS_CLIENT_ID) {
  console.error('missing envar VITE_WORKOS_CLIENT_ID')
}
if (!WORKOS_REDIRECT_URI) {
  console.error('missing envar VITE_WORKOS_REDIRECT_URI')
}

const convexClient = new ConvexReactClient(CONVEX_URL)

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthKitProvider
      clientId={WORKOS_CLIENT_ID}
      redirectUri={WORKOS_REDIRECT_URI}
    >
      <ConvexProviderWithAuthKit client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuthKit>
    </AuthKitProvider>
  )
}
