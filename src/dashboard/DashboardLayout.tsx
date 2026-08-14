import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { supabase } from '../lib/supabase'
import type { DashboardContextValue, Profile } from './DashboardContext'

type NavItem = { to: string; label: string; icon: string; end?: boolean }

const primaryNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: '⌂', end: true },
  { to: '/dashboard/certificates', label: 'Certificates', icon: '▣', end: true },
  { to: '/dashboard/certificates/new', label: 'Issue Certificate', icon: '＋' },
  { to: '/dashboard/verification', label: 'Verification', icon: '✓' },
]

const workspaceNav: NavItem[] = [
  { to: '/dashboard/organization', label: 'Organization', icon: '◌' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙' },
]

function NavItems({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return <nav className="space-y-1" aria-label="Dashboard navigation">
    {items.map(({ to, label, icon, end }) => <NavLink key={to} to={to} end={end} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'}`}>
      <span className="grid size-5 place-items-center text-base leading-none" aria-hidden="true">{icon}</span>{label}
    </NavLink>)}
  </nav>
}

function UserBlock({ fullName, email, onSignOut, isSigningOut }: { fullName: string | null; email?: string; onSignOut: () => void; isSigningOut: boolean }) {
  const initial = (fullName || email || 'C').trim().charAt(0).toUpperCase()
  return <div className="rounded-2xl border border-slate-200 bg-white p-3">
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand">{initial}</span>
      <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{fullName || 'Certora member'}</p><p className="truncate text-xs text-slate-500">{email}</p></div>
    </div>
    <button className="mt-3 w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={onSignOut} disabled={isSigningOut}>{isSigningOut ? 'Logging out...' : 'Log out'}</button>
  </div>
}

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const userId = user?.id
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState<string | null>(null)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setOrganizationId(null)
      setIsProfileLoading(false)
      return
    }

    setIsProfileLoading(true)
    setProfileError(null)
    const { data, error } = await supabase.from('profiles').select('full_name, organization_id').eq('user_id', userId).maybeSingle()
    if (error) {
      setProfileError('We could not load your profile details yet.')
      setProfile(null)
      setOrganizationId(null)
      setIsProfileLoading(false)
      return
    }

    setProfile(data)
    let resolvedOrganizationId = data?.organization_id ?? null
    if (!resolvedOrganizationId) {
      const { data: membership, error: membershipError } = await supabase.from('organization_memberships').select('organization_id').eq('user_id', userId).limit(1).maybeSingle()
      if (membershipError) setProfileError('We could not load your organization details yet.')
      resolvedOrganizationId = membership?.organization_id ?? null
    }
    setOrganizationId(resolvedOrganizationId)
    setIsProfileLoading(false)
  }, [userId])

  useEffect(() => {
    void refreshProfile()
  }, [refreshProfile])

  async function handleSignOut() {
    setSignOutError(null)
    setIsSigningOut(true)
    const { error } = await signOut()
    setIsSigningOut(false)
    if (error) {
      setSignOutError('We could not sign you out. Please try again.')
      return
    }
    navigate('/login', { replace: true })
  }

  const context: DashboardContextValue = { profile, organizationId, isProfileLoading, profileError, refreshProfile }

  return <div className="min-h-screen bg-slate-50 text-ink">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-2 text-ink" aria-label="Certora dashboard"><span className="grid size-9 place-items-center rounded-xl bg-brand text-base font-bold text-white shadow-sm">C</span><span className="text-xl font-semibold tracking-tight">Certora</span></Link>
      <div className="mt-9"><p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p><div className="mt-3"><NavItems items={primaryNav} /></div></div>
      <div className="mt-8"><p className="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace settings</p><div className="mt-3"><NavItems items={workspaceNav} /></div></div>
      <div className="mt-auto"><UserBlock fullName={profile?.full_name ?? null} email={user?.email} onSignOut={handleSignOut} isSigningOut={isSigningOut} />{signOutError && <p className="mt-3 text-xs leading-5 text-red-700" role="alert">{signOutError}</p>}</div>
    </aside>

    <header className="sticky top-0 z-20 flex h-17 items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:ml-68 md:px-8">
      <Link to="/dashboard" className="flex items-center gap-2 text-ink md:hidden"><span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">C</span><span className="font-semibold">Certora</span></Link>
      <p className="hidden text-sm font-medium text-slate-500 md:block">Certificate workspace</p>
      <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-ink">{profile?.full_name || 'Certora member'}</p><p className="max-w-48 truncate text-xs text-slate-500">{user?.email}</p></div><span className="grid size-9 place-items-center rounded-full bg-brand-light text-sm font-bold text-brand">{(profile?.full_name || user?.email || 'C').charAt(0).toUpperCase()}</span><button className="grid size-10 place-items-center rounded-xl border border-slate-200 text-lg text-slate-600 md:hidden" type="button" aria-label="Open navigation" aria-expanded={isMobileNavOpen} onClick={() => setIsMobileNavOpen((open) => !open)}>☰</button></div>
    </header>

    {isMobileNavOpen && <div className="fixed inset-x-0 top-17 z-20 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden"><NavItems items={primaryNav} onNavigate={() => setIsMobileNavOpen(false)} /><div className="my-4 border-t border-slate-200" /><NavItems items={workspaceNav} onNavigate={() => setIsMobileNavOpen(false)} /><div className="mt-5"><UserBlock fullName={profile?.full_name ?? null} email={user?.email} onSignOut={handleSignOut} isSigningOut={isSigningOut} /></div></div>}

    <main className="mx-auto max-w-7xl px-5 py-8 md:ml-68 md:px-8 md:py-10"><Outlet context={context} /></main>
  </div>
}
