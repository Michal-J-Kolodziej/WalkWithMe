import { ArrowRight, MapPin, Search } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/card'

export function HeroSection() {
  return (
    <div className="relative isolate overflow-hidden pt-14">
      {/* Background gradients */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-secondary/30 opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-primary/20 transition-all bg-background/50">
              Join the fastest growing dog community.{' '}
              <a href="#" className="font-semibold text-primary">
                Read more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
            Find your perfect <br />
            <span className="text-primary">
              dog walking buddy
            </span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Connect with local dog owners, arrange meetups, and make walking your dog the highlight of your day. Join thousands of happy tails in your city.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="rounded-full text-lg px-8 shadow-lg shadow-primary/20">
              Start Walking
            </Button>
            <Button variant="ghost" size="lg" className="rounded-full gap-2">
              Learn more <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Floating UI Elements / Mockups */}
          <div className="mt-16 flow-root sm:mt-24 pointer-events-none select-none">
            <div className="-m-2 rounded-xl bg-background/50 p-2 ring-1 ring-inset ring-border lg:-m-4 lg:rounded-2xl lg:p-4 backdrop-blur-sm">
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Mock Stat Card 1 */}
                  <Card className="flex flex-col items-center p-6 border-0 shadow-sm">
                    <MapPin className="h-8 w-8 text-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">50+</div>
                    <div className="text-sm text-muted-foreground">Parks Near You</div>
                  </Card>
                  {/* Mock Stat Card 2 */}
                  <Card className="flex flex-col items-center p-6 scale-110 shadow-md border-primary/20 bg-background">
                    <Search className="h-8 w-8 text-secondary mb-2" />
                    <div className="text-2xl font-bold text-foreground">2k+</div>
                    <div className="text-sm text-muted-foreground">Active Walkers</div>
                  </Card>
                  {/* Mock Stat Card 3 */}
                  <Card className="flex flex-col items-center p-6 border-0 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-secondary to-primary mb-2" />
                    <div className="text-2xl font-bold text-foreground">100%</div>
                    <div className="text-sm text-muted-foreground">Tail Wags</div>
                  </Card>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-secondary/30 to-primary/30 opacity-60 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
    </div>
  )
}
