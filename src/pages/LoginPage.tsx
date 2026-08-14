import { Link } from 'react-router-dom'
import { PlaceholderPage } from '../components/PlaceholderPage'

export function LoginPage() { return <PlaceholderPage eyebrow="Welcome back" title="Log in to Certora" description="Authentication will be connected to your organization account in a future release."><p className="mt-8 text-sm text-slate-500">New to Certora? <Link className="font-semibold text-brand" to="/signup">Create an account</Link></p></PlaceholderPage> }
