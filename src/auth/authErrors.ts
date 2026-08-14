export function getAuthErrorMessage(error: Error) {
  const message = error.message.toLowerCase()

  if (message.includes('invalid login credentials')) return 'We could not sign you in with that email and password.'
  if (message.includes('email not confirmed')) return 'Confirm your email before logging in. Check your inbox for the confirmation link.'
  if (message.includes('user already registered')) return 'An account already exists for this email. Try logging in instead.'
  if (message.includes('password should be at least')) return 'Choose a password with at least 8 characters.'
  if (message.includes('rate limit') || message.includes('too many requests')) return 'Too many attempts. Please wait a moment and try again.'

  return 'Something went wrong. Please try again.'
}
