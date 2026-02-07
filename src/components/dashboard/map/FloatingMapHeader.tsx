import { useQuery } from 'convex/react'
import { Menu, Search } from 'lucide-react'
import { useContext } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DashboardContext } from '@/components/layouts/DashboardLayout'

interface FloatingMapHeaderProps {
  onSearch?: (term: string) => void
}

export function FloatingMapHeader({ onSearch }: FloatingMapHeaderProps) {
  const user = useQuery(api.users.current)
  const { setMobileOpen } = useContext(DashboardContext)

  return (
    <div className="absolute top-4 left-0 right-0 z-[5] px-4">
      <div className="mx-auto max-w-md w-full">
        <div className="relative flex items-center gap-3 p-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg ring-1 ring-black/5">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-10 w-10 rounded-xl text-white/80 hover:bg-white/10 hover:text-white shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Search Input */}
          <div className="flex-1 relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search location..."
              className="h-10 bg-white/5 border-transparent focus-visible:bg-white/10 focus-visible:ring-0 focus-visible:border-white/20 text-white placeholder:text-white/40 pl-9 rounded-xl transition-all"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
