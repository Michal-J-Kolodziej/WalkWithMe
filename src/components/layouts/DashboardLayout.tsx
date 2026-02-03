import { useAuthActions } from '@convex-dev/auth/react'
import { Link, useLocation } from '@tanstack/react-router'
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Dog,
    Home,
    LogOut,
    Menu,
    MessageSquare,
    PawPrint,
    Search,
    Settings,
    User,
    Users,
    X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocationTracker } from '../../hooks/useLocationTracker'
import { BeaconToggle } from '../dashboard/beacon/BeaconToggle'

interface DashboardLayoutProps {
  children: ReactNode
  user: {
    name?: string
    email?: string
    role?: string
  } | null
}

interface NavItem {
  icon: typeof Home
  labelKey: string
  href: string
}

const navItems: Array<NavItem> = [
  { icon: Home, labelKey: 'nav.dashboard', href: '/dashboard' },
  { icon: Dog, labelKey: 'nav.myDogs', href: '/dashboard/dogs' },
  { icon: Users, labelKey: 'nav.friends', href: '/dashboard/friends' },
  { icon: MessageSquare, labelKey: 'nav.chat', href: '/dashboard/chat' },
  { icon: Calendar, labelKey: 'nav.meetings', href: '/dashboard/meetings' },
  { icon: Search, labelKey: 'nav.discover', href: '/dashboard/discover' },
  { icon: User, labelKey: 'nav.profile', href: '/dashboard/profile' },
  { icon: Settings, labelKey: 'nav.settings', href: '/dashboard/settings' },
]

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { signOut } = useAuthActions()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
  }

  // Enable background location tracking
  useLocationTracker()

  return (
    <div className="dashboard-layout bg-gradient-to-br from-background via-background to-muted/30">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          dashboard-sidebar glass-sidebar
          ${collapsed ? 'collapsed' : ''}
          ${mobileOpen ? 'open' : ''}
        `}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                <PawPrint className="h-5 w-5" />
              </div>
              {!collapsed && (
                <span className="text-lg font-bold tracking-tight">
                  WalkWithMe
                </span>
              )}
            </Link>

            {/* Mobile Close */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : ''}`}
                  />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-border/50 pt-4 mt-4 space-y-2">
            {!collapsed && <BeaconToggle />}
            {!collapsed && user && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user.role || 'Member'}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full
                text-muted-foreground hover:bg-destructive/10 hover:text-destructive
                transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{t('nav.signOut')}</span>}
            </button>
          </div>

          {/* Collapse Toggle - Desktop Only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center p-2 mt-4 
              rounded-xl border border-border/50 hover:bg-muted
              transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`dashboard-main ${collapsed ? 'sidebar-collapsed' : ''}`}
      >
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 glass px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 hover:bg-muted rounded-lg cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <span className="font-bold">WalkWithMe</span>
          </Link>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
