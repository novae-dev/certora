import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

type VerificationResult = { certificate_id: string; recipient_name: string; title: string; description: string | null; issue_date: string; status: 'issued' | 'revoked'; organization_name: string }

export function VerificationPage() {
  const [certificateId, setCertificateId] = useState('')
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setResult(null)
    const lookup = certificateId.trim()
    if (!lookup) { setError('Enter a certificate ID to verify.'); return }
    setSubmittedId(lookup)
    setIsLoading(true)
    const { data, error: verificationError } = await supabase.rpc('verify_certificate', { lookup_certificate_id: lookup })
    setIsLoading(false)
    if (verificationError) { setError('We could not verify this certificate right now. Please try again.'); return }
    setResult(((data ?? []) as VerificationResult[])[0] ?? null)
  }

  return <div className="space-y-8"><section><p className="text-sm font-semibold text-brand">Verification</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Verify a certificate</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Check the status of a certificate using its unique certificate ID.</p></section><section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><span className="grid size-12 place-items-center rounded-2xl bg-brand-light text-xl text-brand" aria-hidden="true">✓</span><h2 className="mt-5 text-xl font-semibold">Certificate verification</h2><p className="mt-2 leading-7 text-slate-500">Enter the certificate ID shown on a certificate to check its validity.</p><form className="mt-7 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}><label className="sr-only" htmlFor="certificate-id">Certificate ID</label><input id="certificate-id" className="w-full flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-3 focus:ring-brand/15" placeholder="e.g. CERT-AB12CD34EF56" value={certificateId} onChange={(event) => setCertificateId(event.target.value)} disabled={isLoading} /><button className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>{isLoading ? 'Checking...' : 'Verify'}</button></form>{error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">{error}</p>}{!isLoading && submittedId && !error && !result && <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600" role="status">No certificate found for <span className="font-mono font-semibold text-ink">{submittedId}</span>.</p>}{result && <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{result.certificate_id}</p><h3 className="mt-1 text-lg font-semibold">{result.title}</h3></div><span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${result.status === 'issued' ? 'bg-brand-light text-brand-dark' : 'bg-red-50 text-red-700'}`}>{result.status === 'issued' ? 'Valid · Issued' : 'Revoked'}</span></div><dl className="mt-5 grid gap-4 sm:grid-cols-2"><Detail label="Recipient" value={result.recipient_name} /><Detail label="Issue date" value={result.issue_date} /><Detail label="Organization" value={result.organization_name} />{result.description && <Detail label="Description" value={result.description} />}</dl><Link to={`/verify/${result.certificate_id}`} className="mt-6 inline-flex text-sm font-semibold text-brand hover:text-brand-dark">Open public verification page →</Link></div>}</section></div>
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</dt><dd className="mt-1 text-sm leading-6 text-ink">{value}</dd></div> }
