import { useAuthActions } from '@convex-dev/auth/react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Lock,
  Mail,
  PawPrint,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/input'
import { Label } from './ui/label'

type Step = 'request' | { email: string }

export function ForgotPasswordForm() {
  const { signIn } = useAuthActions()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('request')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleRequestReset = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string

    try {
      await signIn('password', formData)
      setStep({ email })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send reset code. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      await signIn('password', formData)
      setSuccess(true)
      setTimeout(() => {
        navigate({ to: '/login' })
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Invalid code or password. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform duration-200 group-hover:scale-105">
              <PawPrint className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              WalkWithMe
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-xl border border-border/50 p-8 backdrop-blur-sm">
          {success ? (
            // Success State
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20 text-secondary">
                  <KeyRound className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Password Reset!
              </h1>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully reset. Redirecting to
                login...
              </p>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-secondary animate-pulse w-full" />
              </div>
            </div>
          ) : step === 'request' ? (
            // Step 1: Request Reset Code
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Forgot password?
                </h1>
                <p className="text-muted-foreground">
                  Enter your email and we&apos;ll send you a reset code
                </p>
              </div>

              <form onSubmit={handleRequestReset} className="space-y-6">
                <input name="flow" type="hidden" value="reset" />

                {/* Email Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-foreground font-medium"
                  >
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="pl-10 h-12 rounded-xl bg-background border-border focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Sending code...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Reset Code
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            // Step 2: Enter Code and New Password
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Check your email
                </h1>
                <p className="text-muted-foreground">
                  We sent a code to{' '}
                  <span className="font-medium text-foreground">
                    {step.email}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerifyReset} className="space-y-6">
                <input name="flow" type="hidden" value="reset-verification" />
                <input name="email" type="hidden" value={step.email} />

                {/* Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-foreground font-medium">
                    Reset Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      placeholder="Enter 8-digit code"
                      required
                      className="pl-10 h-12 rounded-xl bg-background border-border focus:border-primary transition-colors tracking-widest text-center font-mono"
                    />
                  </div>
                </div>

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-foreground font-medium"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="pl-10 h-12 rounded-xl bg-background border-border focus:border-primary transition-colors"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Resetting password...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Reset Password
                      <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('request')
                    setError(null)
                  }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Try a different email
                </button>
              </form>
            </>
          )}

          {/* Back to Sign In Link */}
          {!success && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Remember your password?
                  </span>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
