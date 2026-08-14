import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '../../auth/useAuth'
import { useDashboard } from '../../dashboard/DashboardContext'
import { supabase } from '../../lib/supabase'

type Organization = { id: string; name: string; slug: string }
const fieldClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-3 focus:ring-brand/15'

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }

export function OrganizationPage() {
  const { user } = useAuth()
  const { isProfileLoading, organizationId, refreshProfile } = useDashboard()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    let isMounted = true
    if (!organizationId) { setOrganization(null); setIsLoading(false); return () => { isMounted = false } }
    setIsLoading(true)
    setError(null)
    void supabase.from('organizations').select('id, name, slug').eq('id', organizationId).maybeSingle().then(({ data, error: organizationError }) => {
      if (!isMounted) return
      setOrganization(data)
      setError(organizationError ? 'We could not load organization details yet.' : null)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [organizationId])

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (!user) { setError('Your session has expired. Please log in again.'); return }
    if (name.trim().length < 2) { setError('Enter an organization name.'); return }
    const slug = slugify(name)
    if (!slug) { setError('Choose an organization name using letters or numbers.'); return }
    setIsCreating(true)
    const { data, error: createError } = await supabase.from('organizations').insert({ name: name.trim(), slug, owner_id: user.id }).select('id, name, slug').single()
    if (createError || !data) {
      setIsCreating(false)
      setError(createError?.message.toLowerCase().includes('duplicate') ? 'That organization name is already in use. Try another name.' : 'We could not create your organization. Please try again.')
      return
    }

    const { error: profileUpdateError } = await supabase.from('profiles').update({ organization_id: data.id }).eq('user_id', user.id)
    await refreshProfile()
    setIsCreating(false)
    setOrganization(data)
    if (profileUpdateError) setError('Organization created, but we could not link it to your profile yet.')
  }

  return <div className="space-y-8"><section><p className="text-sm font-semibold text-brand">Workspace settings</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Organization</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Manage the organization behind your certificate workspace.</p></section>{(isProfileLoading || isLoading) && <section className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm" role="status">Loading organization details...</section>}{!isProfileLoading && !isLoading && organization && <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold text-brand">Your organization</p><h2 className="mt-2 text-2xl font-semibold">{organization.name}</h2><p className="mt-2 text-sm text-slate-500">Slug: {organization.slug}</p><p className="mt-5 rounded-xl bg-brand-light px-4 py-3 text-sm leading-6 text-brand-dark">You are the owner of this organization and can issue certificates for it.</p></section>}{!isProfileLoading && !isLoading && !organization && <section className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="grid size-12 place-items-center rounded-2xl bg-brand-light text-xl text-brand" aria-hidden="true">◌</span><h2 className="mt-5 text-xl font-semibold">No organization yet</h2><p className="mt-2 leading-7 text-slate-500">Create an organization to manage the certificates issued by your team.</p><form className="mt-6" onSubmit={handleCreate}><label className="block text-sm font-semibold text-slate-700">Organization name<input className={fieldClass} type="text" placeholder="e.g. Certora Academy" value={name} onChange={(event) => setName(event.target.value)} disabled={isCreating} required /></label>{error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">{error}</p>}<button className="mt-5 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isCreating}>{isCreating ? 'Creating organization...' : 'Create organization'}</button></form></section>}{error && organization && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">{error}</p>}</div>
}
