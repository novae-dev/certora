import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Brand } from '../components/Brand'
import { supabase } from '../lib/supabase'

type VerificationResult = { certificate_id: string; recipient_name: string; title: string; description: string | null; issue_date: string; status: 'issued' | 'revoked'; organization_name: string }

export function VerifyPage() {
  const { certificateId } = useParams()
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    if (!certificateId) { setIsLoading(false); setError('No certificate ID was provided.'); return () => { isMounted = false } }
    setIsLoading(true)
    setError(null)
    void supabase.rpc('verify_certificate', { lookup_certificate_id: certificateId }).then(({ data, error: verificationError }) => {
      if (!isMounted) return
      if (verificationError) setError('We could not verify this certificate right now. Please try again.')
      else setResult(((data ?? []) as VerificationResult[])[0] ?? null)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [certificateId])

  return <main className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto max-w-2xl"><Brand /><section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(16,24,40,0.08)] sm:p-9"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Public verification</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Certora Verified Certificate</h1></div><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${result?.status === 'revoked' ? 'bg-red-50 text-red-700' : 'bg-brand-light text-brand'}`} aria-hidden="true">{result?.status === 'revoked' ? '!' : '✓'}</span></div>{isLoading && <div className="mt-10 rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500" role="status">Checking certificate...</div>}{!isLoading && error && <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm leading-6 text-red-700" role="alert">{error}</div>}{!isLoading && !error && !result && <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center"><h2 className="text-lg font-semibold">Certificate not found</h2><p className="mt-2 text-sm leading-6 text-slate-500">We could not find a certificate with ID <span className="font-semibold text-slate-700">{certificateId}</span>.</p></div>}{result && <div className="mt-10"><div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Certificate ID</p><p className="mt-1 font-mono text-lg font-semibold text-brand">{result.certificate_id}</p></div><span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${result.status === 'issued' ? 'bg-brand-light text-brand-dark' : 'bg-red-50 text-red-700'}`}>{result.status === 'issued' ? 'Valid · Issued' : 'Revoked'}</span></div><dl className="mt-6 space-y-5"><Detail label="Recipient" value={result.recipient_name} /><Detail label="Certificate title" value={result.title} />{result.description && <Detail label="Description" value={result.description} />}<Detail label="Issue date" value={result.issue_date} /><Detail label="Issuing organization" value={result.organization_name} /></dl></div>}<Link to="/" className="mt-8 inline-block text-sm font-semibold text-brand hover:text-brand-dark">Back to Certora</Link></section></div></main>
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</dt><dd className="mt-1 text-base leading-7 text-ink">{value}</dd></div> }
