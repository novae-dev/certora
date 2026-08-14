import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../../dashboard/DashboardContext'
import { supabase } from '../../lib/supabase'

type Certificate = { certificate_id: string; recipient_name: string; title: string; issue_date: string; status: 'issued' | 'revoked' }

export function CertificatesPage() {
  const { organizationId, isProfileLoading } = useDashboard()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'issued' | 'revoked'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!organizationId) { setCertificates([]); setIsLoading(false); return () => { isMounted = false } }
    setIsLoading(true)
    setError(null)
    void supabase.from('certificates').select('certificate_id, recipient_name, title, issue_date, status').eq('organization_id', organizationId).order('created_at', { ascending: false }).then(({ data, error: queryError }) => {
      if (!isMounted) return
      setCertificates((data ?? []) as Certificate[])
      setError(queryError ? 'We could not load your certificates yet.' : null)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [organizationId])

  const filteredCertificates = useMemo(() => certificates.filter((certificate) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [certificate.certificate_id, certificate.recipient_name, certificate.title].some((value) => value.toLowerCase().includes(query))
    return matchesSearch && (status === 'all' || certificate.status === status)
  }), [certificates, search, status])

  return <div className="space-y-8"><section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold text-brand">Certificate management</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Certificates</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Create, issue, and manage certificates for your organization.</p></div><Link to="/dashboard/certificates/new" className="inline-flex justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">Issue Certificate</Link></section>
    {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row"><label className="flex-1"><span className="sr-only">Search certificates</span><input className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15" type="search" placeholder="Search by ID, recipient, or title" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label><span className="sr-only">Filter by status</span><select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/15" value={status} onChange={(event) => setStatus(event.target.value as 'all' | 'issued' | 'revoked')}><option value="all">All statuses</option><option value="issued">Issued</option><option value="revoked">Revoked</option></select></label></div>{isLoading || isProfileLoading ? <div className="grid min-h-64 place-items-center text-sm text-slate-500" role="status">Loading certificates...</div> : filteredCertificates.length === 0 ? <div className="grid min-h-72 place-items-center px-5 py-10 text-center"><div className="max-w-sm"><h2 className="text-xl font-semibold">{certificates.length ? 'No matching certificates' : 'No certificates yet'}</h2><p className="mt-2 leading-7 text-slate-500">{certificates.length ? 'Try a different search or status filter.' : 'Issue your first certificate to start building your organization record.'}</p>{!certificates.length && <Link to="/dashboard/certificates/new" className="mt-6 inline-flex rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">Issue your first certificate</Link>}</div></div> : <div className="divide-y divide-slate-100">{filteredCertificates.map((certificate) => <div key={certificate.certificate_id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><Link to={`/verify/${certificate.certificate_id}`} className="font-semibold text-brand hover:text-brand-dark">{certificate.certificate_id}</Link><p className="mt-1 truncate text-sm text-slate-500">{certificate.recipient_name} · {certificate.title}</p></div><div className="flex items-center gap-4 text-sm"><span className="text-slate-500">{certificate.issue_date}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${certificate.status === 'issued' ? 'bg-brand-light text-brand-dark' : 'bg-red-50 text-red-700'}`}>{certificate.status === 'issued' ? 'Issued' : 'Revoked'}</span><Link to={`/verify/${certificate.certificate_id}`} className="font-semibold text-slate-600 hover:text-ink">View</Link></div></div>)}</div>}</section></div>
}
