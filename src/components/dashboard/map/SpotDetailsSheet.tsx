import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useSpotDetails, useSpots } from '@/hooks/useSpots'
import { MapPin, MessageSquare, Navigation, Star } from 'lucide-react'
import { useState } from 'react'
import { Id } from '../../../../convex/_generated/dataModel'

interface SpotDetailsSheetProps {
  spotId: Id<'spots'>
  isOpen: boolean
  onClose: () => void
}

export function SpotDetailsSheet({ spotId, isOpen, onClose }: SpotDetailsSheetProps) {
  const { details, isLoading } = useSpotDetails(spotId)
  const { addReview } = useSpots()
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [rating, setRating] = useState(5)

  const handleAddReview = async () => {
    if (!reviewText.trim()) return
    await addReview({
      spotId,
      rating,
      text: reviewText,
      tags: [], // Could add tag selection UI later
    })
    setIsAddingReview(false)
    setReviewText('')
    setRating(5)
  }

  if (isLoading || !details) {
      return (
          <Sheet open={isOpen} onOpenChange={onClose}>
              <SheetContent>
                  <div className="flex items-center justify-center h-full">Loading details...</div>
              </SheetContent>
          </Sheet>
      )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background/95 backdrop-blur-xl border-l border-border/50">
        
        {/* Header Section with subtle gradient background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent h-32 pointer-events-none" />
          <div className="p-6 pb-4 relative z-10">
              <SheetHeader className="text-left space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <SheetTitle className="text-3xl font-bold tracking-tight">{details.name}</SheetTitle>
                    <Badge variant="outline" className="capitalize px-3 py-1 bg-background/50 backdrop-blur-md border-primary/20 text-primary animate-in fade-in zoom-in duration-300">
                      {details.type}
                    </Badge>
                </div>
                <div className="flex items-center text-muted-foreground text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-1.5 text-primary/70" />
                    {details.address}
                </div>
              </SheetHeader>

              <div className="mt-6 flex gap-3">
                  <Button className="flex-1 shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]" size="default" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${details.location.lat},${details.location.lng}`)}>
                      <Navigation className="w-4 h-4 mr-2" /> Navigate
                  </Button>
                  <Button variant="secondary" size="default" className="bg-muted/50 hover:bg-muted" onClick={() => setIsAddingReview(!isAddingReview)}>
                      <MessageSquare className="w-4 h-4 mr-2" /> {isAddingReview ? 'Cancel' : 'Review'}
                  </Button>
              </div>
          </div>
        </div>
        
        <Separator className="bg-border/50" />

        <ScrollArea className="flex-1 p-6 pt-6">
            {details.description && (
                <div className="mb-8 p-4 rounded-xl bg-muted/20 border border-border/40">
                    <h4 className="font-semibold mb-2 text-xs uppercase text-primary/80 tracking-widest flex items-center gap-2">
                      <Star className="w-3 h-3" /> About
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground">{details.description}</p>
                </div>
            )}

            {isAddingReview && (
                <div className="mb-8 bg-card p-5 rounded-2xl border border-border shadow-sm animate-in slide-in-from-top-4 duration-300">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" /> Write a Review
                    </h4>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Rating</Label>
                              <span className="text-sm font-bold text-primary">{rating}/5</span>
                            </div>
                            <Slider 
                                value={[rating]} 
                                onValueChange={(v) => setRating(v[0])} 
                                max={5} 
                                step={1} 
                                className="py-2"
                            />
                        </div>
                        <Textarea 
                            value={reviewText} 
                            onChange={(e) => setReviewText(e.target.value)} 
                            placeholder="Share your experience... (e.g., 'Great for small dogs', 'Muddy after rain')"
                            className="bg-background/50 min-h-[100px]"
                        />
                        <Button onClick={handleAddReview} className="w-full">Submit Review</Button>
                    </div>
                </div>
            )}

            <div>
                <h4 className="font-semibold mb-5 text-xs uppercase text-muted-foreground tracking-widest flex items-center justify-between">
                    <span>Reviews</span>
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{details.reviews?.length || 0}</Badge>
                </h4>
                <div className="space-y-4">
                    {details.reviews?.length === 0 ? (
                        <div className="text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-muted-foreground/20">
                          <p className="text-sm text-muted-foreground italic">No reviews yet. Be the first to verify this spot!</p>
                        </div>
                    ) : (
                        details.reviews?.map((review: any) => (
                            <div key={review._id} className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-border/40 hover:bg-card/60 transition-colors">
                                <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
                                    <AvatarImage src={review.user?.image} />
                                    <AvatarFallback>{review.user?.name?.[0] || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">{review.user?.name}</span>
                                        <div className="flex items-center bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            <span className="text-xs font-bold mr-1">{review.rating}</span>
                                            <Star className="w-3 h-3 fill-current" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-snug">{review.text}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ScrollArea>

      </SheetContent>
    </Sheet>
  )
}
