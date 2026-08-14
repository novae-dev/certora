import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAuthErrorMessage } from '../auth/authErrors'
import { PlaceholderPage } from '../components/PlaceholderPage'
import { supabase } from '../lib/supabase'

type FieldErrors = Partial<Record<'fullName' | 'email' | 'password' | 'passwordConfirmation', string>>
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [confirmationRequired, setConfirmationRequired] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const nextFieldErrors: FieldErrors = {}

    if (fullName.trim().length < 2) nextFieldErrors.fullName = 'Enter your full name.'
    if (!emailPattern.test(email.trim())) nextFieldErrors.email = 'Enter a valid email address.'
    if (password.length < 8) nextFieldErrors.password = 'Use at least 8 characters.'
    if (password !== passwordConfirmation) nextFieldErrors.passwordConfirmation = 'Passwords do not match.'

    setFieldErrors(nextFieldErrors)
    if (Object.keys(nextFieldErrors).length > 0) return

    setIsSubmitting(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName.trim() } },
    })
    setIsSubmitting(false)

    if (signUpError) {
      setError(getAuthErrorMessage(signUpError))
      return
    }

    if (data.session) {
      navigate('/dashboard', { replace: true })
      return
    }

    setConfirmationRequired(true)
  }

  if (confirmationRequired) {
    return <PlaceholderPage eyebrow="Check your inbox" title="Confirm your email" description={`We sent a confirmation link to ${email}. Open it to activate your Certora account.`}>
      <p className="mt-7 text-sm leading-6 text-slate-500">After confirming, return to log in. You can keep using this email address.</p>
      <Link className="mt-6 inline-flex rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark" to={`/login?email=${encodeURIComponent(email)}`}>Go to log in</Link>
    </PlaceholderPage>
  }

  return <PlaceholderPage eyebrow="Get started" title="Create your Certora account" description="Set up a secure account for your certificate workspace.">
    <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
      <label className="block text-sm font-semibold text-slate-700">Full name
        <input className="mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-ink outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15" type="text" autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); clearFieldError('fullName') }} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.fullName)} aria-describedby={fieldErrors.fullName ? 'signup-full-name-error' : undefined} required />
        {fieldErrors.fullName && <span id="signup-full-name-error" className="mt-1.5 block text-sm font-normal text-red-700">{fieldErrors.fullName}</span>}
      </label>
      <label className="block text-sm font-semibold text-slate-700">Email address
        <input className="mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-ink outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); clearFieldError('email') }} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined} required />
        {fieldErrors.email && <span id="signup-email-error" className="mt-1.5 block text-sm font-normal text-red-700">{fieldErrors.email}</span>}
      </label>
      <label className="block text-sm font-semibold text-slate-700">Password <span className="font-normal text-slate-500">(8+ characters)</span>
        <input className="mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-ink outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => { setPassword(event.target.value); clearFieldError('password') }} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined} required />
        {fieldErrors.password && <span id="signup-password-error" className="mt-1.5 block text-sm font-normal text-red-700">{fieldErrors.password}</span>}
      </label>
      <label className="block text-sm font-semibold text-slate-700">Confirm password
        <input className="mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-ink outline-none transition focus:border-brand focus:ring-3 focus:ring-brand/15" type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => { setPasswordConfirmation(event.target.value); clearFieldError('passwordConfirmation') }} disabled={isSubmitting} aria-invalid={Boolean(fieldErrors.passwordConfirmation)} aria-describedby={fieldErrors.passwordConfirmation ? 'signup-password-confirmation-error' : undefined} required />
        {fieldErrors.passwordConfirmation && <span id="signup-password-confirmation-error" className="mt-1.5 block text-sm font-normal text-red-700">{fieldErrors.passwordConfirmation}</span>}
      </label>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-6 text-red-700" role="alert">{error}</p>}
      <button className="w-full rounded-xl bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</button>
    </form>
    <p className="mt-7 text-sm text-slate-500">Already have an account? <Link className="font-semibold text-brand hover:text-brand-dark" to="/login">Log in</Link></p>
  </PlaceholderPage>
}
