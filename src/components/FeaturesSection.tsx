import { Calendar, Heart, Map, MessageCircle, ShieldCheck, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'

const features = [
  {
    title: 'Find Walking Buddies',
    description: 'Connect with local dog owners who match your walking schedule and pace.',
    icon: Users,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Interactive Maps',
    description: 'Discover popular dog-friendly routes, parks, and meeting spots in your city.',
    icon: Map,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    title: 'Real-time Chat',
    description: 'Coordinate meetups easily with built-in private messaging and group chats.',
    icon: MessageCircle,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    title: 'Profile & Dogs',
    description: 'Showcase your furry friend with a beautiful dedicated profile page.',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
  },
  {
    title: 'Event Planning',
    description: 'Organize or join group walks and social events for your community.',
    icon: Calendar,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
  },
  {
    title: 'Safe Community',
    description: 'Verified profiles and community reviews ensure a safe environment for everyone.',
    icon: ShieldCheck,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-secondary/5">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            More than just a walk
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We provide all the tools you need to build a thriving community around your dog's social life.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card md:hover:-translate-y-1">
                <CardHeader>
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} ${feature.color}`}>
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-7">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
