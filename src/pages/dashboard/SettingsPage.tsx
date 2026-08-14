import { useAuth } from '../../auth/useAuth'
import { useDashboard } from '../../dashboard/DashboardContext'

export function SettingsPage() {
  const { user } = useAuth()
  const { profile, isProfileLoading, profileError } = useDashboard()

  return <div className="space-y-8"><section><p className="text-sm font-semibold text-brand">Workspace settings</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Settings</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Review your profile, account, and security details.</p></section><SettingsCard title="Profile" description="Your information from your Certora profile."><SettingsRow label="Full name" value={isProfileLoading ? 'Loading...' : profile?.full_name || 'Not provided'} /><SettingsRow label="Email address" value={user?.email || 'Not available'} />{profileError && <p className="mt-4 text-sm text-amber-800" role="status">{profileError}</p>}</SettingsCard><SettingsCard title="Account" description="Your account is managed through secure email authentication."><SettingsRow label="Account status" value={user?.email_confirmed_at ? 'Email confirmed' : 'Email confirmation pending'} /><SettingsRow label="User ID" value={user?.id || 'Not available'} mono /></SettingsCard><SettingsCard title="Security" description="Keep your account secure with a verified email and a strong password."><div className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">Password and email-security management will be available here in a future phase.</div></SettingsCard></div>
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p><div className="mt-5 space-y-4">{children}</div></section>
}

function SettingsRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"><p className="text-sm font-medium text-slate-500">{label}</p><p className={`break-all text-sm font-semibold text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</p></div>
}
