import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getAuthErrorMessage } from '../auth/authErrors'
import { PlaceholderPage } from '../components/PlaceholderPage'
import { supabase } from '../lib/supabase'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get('email') ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Enter your email address.')
      return
    }

    if (!emailPattern.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    if (!password) {
      setError('Enter your password.')
      return
    }

    setIsSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setIsSubmitting(false)

    if (signInError) {
      setError(getAuthErrorMessage(signInError))
      return
    }

    const destination = typeof location.state?.from === 'string' ? location.state.from : '/dashboard'
    navigate(destination, { replace: true })
  }

  return <PlaceholderPage eyebrow="Welcome back" title="Log in to Certora" description="Access your organization's certificate workspace.">
    <form className="mt-8 space-y-5" onSubmit={handleSubmit} aria-describedby={error ? 'login-error' : undefined}>
      <label className="block text-sm font-semibold text-slate-700">Email address
        <input className="mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-ink outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} aria-invalid={Boolean(error)} required />
      </label>
      <label className="block text-sm font-semibold text-slate-700">Password
        <input className="mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-ink outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isSubmitting} aria-invalid={Boolean(error)} required />
      </label>
      {error && <p id="login-error" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-6 text-red-700" role="alert">{error}</p>}
      <button className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Log in'}</button>
    </form>
    <p className="mt-7 text-sm text-slate-500">New to Certora? <Link className="font-semibold text-brand hover:text-brand-dark" to="/signup">Create an account</Link></p>
  </PlaceholderPage>
}
