import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../auth/useAuth'
import { useDashboard } from '../../dashboard/DashboardContext'
import { supabase } from '../../lib/supabase'

const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-3 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-50'
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function IssueCertificatePage() {
  const { user } = useAuth()
  const { organizationId, isProfileLoading } = useDashboard()
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [certificateId, setCertificateId] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (!organizationId) { setError('Create or join an organization before issuing a certificate.'); return }
    if (!recipientName.trim()) { setError('Enter the recipient name.'); return }
    if (!title.trim()) { setError('Enter a certificate title.'); return }
    if (recipientEmail.trim() && !emailPattern.test(recipientEmail.trim())) { setError('Enter a valid recipient email address.'); return }
    if (!user) { setError('Your session has expired. Please log in again.'); return }

    setIsSubmitting(true)
    const { data, error: insertError } = await supabase.from('certificates').insert({ organization_id: organizationId, recipient_name: recipientName.trim(), recipient_email: recipientEmail.trim() || null, title: title.trim(), description: description.trim() || null, issue_date: issueDate || undefined, created_by: user.id }).select('certificate_id').single()
    setIsSubmitting(false)
    if (insertError || !data) { setError('We could not issue this certificate. Please try again.'); return }
    setCertificateId(data.certificate_id)
  }

  if (certificateId) {
    const verificationUrl = `${window.location.origin}/verify/${certificateId}`
    return <div className="space-y-8"><section><p className="text-sm font-semibold text-brand">Certificate issued</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your certificate is ready</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Share the public verification link with the recipient or anyone who needs to confirm this achievement.</p></section><section className="flex max-w-3xl flex-col gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:p-8"><div className="rounded-2xl border border-slate-200 bg-white p-4"><QRCodeSVG value={verificationUrl} size={176} bgColor="#ffffff" fgColor="#101828" includeMargin /></div><div><p className="text-sm font-medium text-slate-500">Certificate ID</p><p className="mt-2 text-2xl font-bold tracking-wide text-brand">{certificateId}</p><p className="mt-4 max-w-md text-sm leading-6 text-slate-500">The QR code opens the public verification page for this certificate.</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><Link to={`/verify/${certificateId}`} className="inline-flex justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">View certificate</Link><Link to="/dashboard/certificates" className="inline-flex justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Return to certificates</Link></div></div></section></div>
  }

  if (isProfileLoading) return <div className="grid min-h-64 place-items-center text-sm text-slate-500" role="status">Loading organization details...</div>
  if (!organizationId) return <div className="space-y-8"><section><p className="text-sm font-semibold text-brand">Certificate management</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Issue Certificate</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Create a new verifiable certificate.</p></section><section className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-lg font-semibold text-amber-950">Organization required</h2><p className="mt-2 text-sm leading-6 text-amber-900">You need an organization before you can issue certificates. Create one from the Organization page, then return here to continue.</p><Link to="/dashboard/organization" className="mt-5 inline-flex rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark">Go to Organization</Link></section></div>

  return <div className="space-y-8"><section><p className="text-sm font-semibold text-brand">Certificate management</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Issue Certificate</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Create a new verifiable certificate.</p></section><form className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Recipient name <span className="text-brand">*</span><input className={fieldClass} type="text" placeholder="Recipient's full name" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} disabled={isSubmitting} required /></label><label className="block text-sm font-semibold text-slate-700">Recipient email<input className={fieldClass} type="email" placeholder="recipient@example.com" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} disabled={isSubmitting} /></label></div><div className="mt-5"><label className="block text-sm font-semibold text-slate-700">Certificate title <span className="text-brand">*</span><input className={fieldClass} type="text" placeholder="Certificate of Achievement" value={title} onChange={(event) => setTitle(event.target.value)} disabled={isSubmitting} required /></label></div><div className="mt-5"><label className="block text-sm font-semibold text-slate-700">Description<textarea className={`${fieldClass} min-h-28 resize-y`} placeholder="Describe the achievement or program" value={description} onChange={(event) => setDescription(event.target.value)} disabled={isSubmitting} /></label></div><div className="mt-5 max-w-xs"><label className="block text-sm font-semibold text-slate-700">Issue date<input className={fieldClass} type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} disabled={isSubmitting} /></label></div>{error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">{error}</p>}<div className="mt-7 border-t border-slate-200 pt-6"><button className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Issuing certificate...' : 'Issue Certificate'}</button></div></form></div>
}
