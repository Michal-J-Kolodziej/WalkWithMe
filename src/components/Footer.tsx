import { Github, Instagram, PawPrint, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="relative border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="sr-only">GitHub</span>
            <Github className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="sr-only">Twitter</span>
            <Twitter className="h-6 w-6" />
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="sr-only">Instagram</span>
            <Instagram className="h-6 w-6" />
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md: justify-start gap-2 mb-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <p className="text-center text-xs leading-5 text-muted-foreground md:text-left">
              &copy; 2024 WalkWithMe Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
