import { Link } from '@tanstack/react-router'
import { Menu, PawPrint, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/Button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <PawPrint className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                WalkWithMe
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Features
              </a>
              <a href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Community
              </a>
              <a href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                About
              </a>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
              <Link to="/register">
                <Button variant="default">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <a href="#features" className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              Features
            </a>
            <a href="#testimonials" className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              Community
            </a>
            <a href="#about" className="block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              About
            </a>
            <div className="mt-4 flex flex-col space-y-2 px-3">
              <Button variant="ghost" className="w-full justify-start">
                Sign In
              </Button>
              <Link to="/register">
                <Button variant="default" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
