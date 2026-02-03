import { Button } from '@/components/ui/button'
import { useBeacon } from '@/hooks/useBeacon'
import { cn } from '@/lib/utils'
import { Footprints } from 'lucide-react'

export function BeaconToggle() {
  const { isActive, toggleBeacon } = useBeacon()

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      className={cn(
        'relative transition-all duration-500 gap-2 font-semibold',
        isActive
          ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)] border-green-400'
          : 'text-muted-foreground hover:text-foreground',
      )}
      onClick={() => toggleBeacon(!isActive)}
    >
      {isActive ? (
        <>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          Walking Now
        </>
      ) : (
        <>
          <Footprints className="w-4 h-4" />
          Broadcast Walk
        </>
      )}
    </Button>
  )
}
