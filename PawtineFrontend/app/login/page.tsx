'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const inputClasses =
  'w-full rounded-xl border border-border bg-card/80 px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)

    // Placeholder for future auth flow.
    setTimeout(() => {
      setError('Login is coming soon - hang tight!')
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-background flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold tracking-[0.25em] text-primary uppercase">
            Pawtine
          </div>
          <h1 className="text-foreground text-3xl md:text-4xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm">
            Sign in to keep your dog's routines synced, hydrated, and happy.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-[0px_20px_60px_rgba(123,91,242,0.12)] p-6 md:p-8 space-y-5"
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@pawtine.com"
              className={inputClasses}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <Link href="#" className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="********"
              className={inputClasses}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={error ? true : undefined}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-100/80 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_rgba(123,91,242,0.7)] hover:bg-primary-dark transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Log In'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="#" className="text-primary font-medium hover:text-primary-dark transition-colors">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
