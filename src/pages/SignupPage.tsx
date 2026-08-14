import { Link } from 'react-router-dom'
import { PlaceholderPage } from '../components/PlaceholderPage'

export function SignupPage() { return <PlaceholderPage eyebrow="Get started" title="Create your Certora account" description="Organization onboarding and secure authentication will be available here soon."><p className="mt-8 text-sm text-slate-500">Already have an account? <Link className="font-semibold text-brand" to="/login">Log in</Link></p></PlaceholderPage> }
