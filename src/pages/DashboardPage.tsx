import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useDashboard } from '../dashboard/DashboardContext'
import { supabase } from '../lib/supabase'

type RecentCertificate = { certificate_id: string; recipient_name: string; title: string; issue_date: string; status: 'issued' | 'revoked' }
type CertificateSummary = { total: number; issued: number; revoked: number; recent: RecentCertificate[] }
const emptySummary: CertificateSummary = { total: 0, issued: 0, revoked: 0, recent: [] }

export function DashboardPage() {
  const { user } = useAuth()
  const { profile, organizationId, isProfileLoading, profileError } = useDashboard()
  const [summary, setSummary] = useState(emptySummary)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    let isMounted = true
    if (!organizationId) {
      setSummary(emptySummary)
      setIsLoading(false)
      return () => { isMounted = false }
    }

    setIsLoading(true)
    setError(null)
    void Promise.all([
      supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
      supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'issued'),
      supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'revoked'),
      supabase.from('certificates').select('certificate_id, recipient_name, title, issue_date, status').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(5),
    ]).then(([totalResult, issuedResult, revokedResult, recentResult]) => {
      if (!isMounted) return
      const queryError = totalResult.error || issuedResult.error || revokedResult.error || recentResult.error
      setError(queryError ? 'We could not load certificate activity yet.' : null)
      setSummary(queryError ? emptySummary : { total: totalResult.count ?? 0, issued: issuedResult.count ?? 0, revoked: revokedResult.count ?? 0, recent: (recentResult.data ?? []) as RecentCertificate[] })
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [organizationId])

  const statistics = [{ label: 'Total Certificates', value: summary.total, note: 'All organization certificates' }, { label: 'Issued', value: summary.issued, note: 'Currently valid certificates' }, { label: 'Revoked', value: summary.revoked, note: 'Certificates no longer valid' }, { label: 'Verifications', value: 0, note: 'Verification analytics coming soon' }]

  return <div className="space-y-8">
    <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-brand">Overview</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Welcome back, {isProfileLoading ? '...' : firstName}</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Manage your certificates, organization, and verification activity.</p></div><Link to="/dashboard/certificates/new" className="inline-flex items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark">Issue Certificate <span className="ml-2 text-lg leading-none" aria-hidden="true">+</span></Link></section>
    {profileError && <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800" role="status">{profileError}</p>}
    {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">{error}</p>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Certificate statistics">{statistics.map((stat) => <article key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{stat.label}</p><p className="mt-5 text-3xl font-semibold tracking-tight text-ink">{isLoading && organizationId ? '...' : stat.value}</p><p className="mt-2 text-sm text-slate-500">{stat.note}</p></article>)}</section>
    <RecentCertificates certificates={summary.recent} isLoading={isLoading} />
    <section><div><p className="text-sm font-semibold text-brand">Quick actions</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Get started with your workspace</h2></div><div className="mt-5 grid gap-4 lg:grid-cols-3"><QuickAction to="/dashboard/certificates/new" icon="+" title="Issue Certificate" description="Create your first certificate" /><QuickAction to="/dashboard/certificates" icon="▣" title="View Certificates" description="Manage certificates issued by your organization" /><QuickAction to="/dashboard/verification" icon="✓" title="Verify Certificate" description="Verify a certificate using its certificate ID" /></div></section>
  </div>
}

function RecentCertificates({ certificates, isLoading }: { certificates: RecentCertificate[]; isLoading: boolean }) {
  return <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-ink">Recent certificates</h2><p className="mt-1 text-sm text-slate-500">Your latest issuance activity will appear here.</p></div><Link to="/dashboard/certificates" className="text-sm font-semibold text-brand hover:text-brand-dark">View all certificates</Link></div>{isLoading ? <div className="grid min-h-48 place-items-center text-sm text-slate-500" role="status">Loading certificates...</div> : certificates.length === 0 ? <div className="grid min-h-70 place-items-center px-5 py-10 text-center"><div className="max-w-sm"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-light text-xl text-brand" aria-hidden="true">▣</span><h3 className="mt-5 text-lg font-semibold">No certificates yet</h3><p className="mt-2 leading-6 text-slate-500">Create your first certificate to get started.</p><Link to="/dashboard/certificates/new" className="mt-6 inline-flex rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark">Issue Certificate</Link></div></div> : <div className="divide-y divide-slate-100">{certificates.map((certificate) => <Link key={certificate.certificate_id} to={`/verify/${certificate.certificate_id}`} className="flex flex-col gap-2 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-ink">{certificate.title}</p><p className="mt-1 text-sm text-slate-500">{certificate.recipient_name} · {certificate.certificate_id}</p></div><div className="flex items-center gap-4 text-sm"><span className="text-slate-500">{certificate.issue_date}</span><StatusBadge status={certificate.status} /></div></Link>)}</div>}</section>
}

function StatusBadge({ status }: { status: 'issued' | 'revoked' }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'issued' ? 'bg-brand-light text-brand-dark' : 'bg-red-50 text-red-700'}`}>{status === 'issued' ? 'Issued' : 'Revoked'}</span> }
function QuickAction({ to, icon, title, description }: { to: string; icon: string; title: string; description: string }) { return <Link to={to} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"><span className="grid size-10 place-items-center rounded-xl bg-brand-light text-lg font-semibold text-brand" aria-hidden="true">{icon}</span><h3 className="mt-5 text-base font-semibold text-ink group-hover:text-brand">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><span className="mt-5 inline-block text-sm font-semibold text-brand">Open <span aria-hidden="true">→</span></span></Link> }
