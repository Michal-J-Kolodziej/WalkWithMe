import { formatDistanceToNow } from 'date-fns'
import { MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useBeacon } from '@/hooks/useBeacon'

export function ActiveWalkersList() {
  const { activeWalkers } = useBeacon()

  if (!activeWalkers || activeWalkers.length === 0) return null

  return (
    <Card className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
      <CardContent className="p-5 flex items-center gap-4 overflow-x-auto">
        <div className="flex flex-col min-w-fit">
          <span className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Walking Now
          </span>
          <span className="text-xs text-muted-foreground">
            {activeWalkers.length} friend{activeWalkers.length !== 1 && 's'}{' '}
            active
          </span>
        </div>

        <div className="h-8 w-px bg-border mx-2" />

        <div className="flex gap-3">
          <TooltipProvider>
            {activeWalkers.map((walker) => (
              <Tooltip key={walker._id}>
                <TooltipTrigger>
                  <div className="group relative flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-green-500 shadow-sm">
                        <AvatarImage src={walker.image} />
                        <AvatarFallback>{walker.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-green-500">
                        <MapPin className="w-3 h-3 text-green-500 fill-green-500" />
                      </div>
                    </div>
                    <span className="text-xs font-medium max-w-[60px] truncate">
                      {walker.name?.split(' ')[0]}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{walker.name}</p>
                  <p className="text-xs opacity-90">
                    Started{' '}
                    {formatDistanceToNow(walker.beacon!.startedAt, {
                      addSuffix: true,
                    })}
                  </p>
                  {walker.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {walker.location}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}
