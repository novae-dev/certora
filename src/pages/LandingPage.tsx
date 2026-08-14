import { ButtonLink } from '../components/ButtonLink'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

const features = [
  ['Designed for trust', 'Every certificate has a public verification page that is simple to share and easy to understand.'],
  ['Built for your team', 'Issue certificates at scale while keeping recipients, templates, and records in one place.'],
  ['Ready to grow', 'A clean foundation for QR codes, PDFs, organization workflows, and certificate analytics.'],
]

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <SiteHeader />
      <main>
        <section className="relative isolate px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
          <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_50%_0%,#dff3eb_0,transparent_58%)]" />
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex rounded-full border border-brand/15 bg-brand-light px-3 py-1 text-sm font-semibold text-brand">The modern certificate platform</p>
            <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-6xl sm:leading-[1.08]">Certificates that carry <span className="text-brand">real confidence.</span></h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">Create, issue, and verify digital certificates from one clear, secure home. Built for organizations that want recognition to be trusted.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink to="/signup" className="px-6 py-3.5">Create Certificate <span aria-hidden="true" className="ml-2">→</span></ButtonLink>
              <ButtonLink to="/verify/demo-certificate" variant="secondary" className="px-6 py-3.5">Verify Certificate</ButtonLink>
            </div>
            <p className="mt-5 text-sm text-slate-500">Create. Issue. Verify.</p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(16,24,40,0.12)] sm:p-5">
            <div className="rounded-xl bg-slate-50 px-5 py-8 text-left sm:px-9 sm:py-10">
              <div className="flex items-center justify-between"><span className="rounded-md bg-brand px-2 py-1 text-xs font-bold text-white">CERTIFICATE</span><span className="text-sm font-medium text-brand">● Verified</span></div>
              <p className="mt-10 text-center font-serif text-3xl text-slate-800 sm:text-4xl">Certificate of Achievement</p>
              <p className="mt-5 text-center text-sm text-slate-500">This certifies that</p>
              <p className="mt-2 text-center text-2xl font-semibold text-ink">Alex Morgan</p>
              <div className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">Issued by Certora Academy · Certificate ID: CRT-2026-0482</div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-slate-200 bg-white px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl"><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">How it works</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">Recognition should be effortless to issue and impossible to question.</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {['Create your certificate', 'Issue with confidence', 'Verify in seconds'].map((step, index) => <div key={step} className="relative"><span className="grid size-10 place-items-center rounded-full bg-brand-light font-bold text-brand">0{index + 1}</span><h3 className="mt-5 text-lg font-semibold">{step}</h3><p className="mt-2 leading-7 text-slate-600">{index === 0 ? 'Start with a polished template tailored to your organization.' : index === 1 ? 'Send certificates to recipients and keep your records organized.' : 'Anyone can confirm a certificate through its unique public link.'}</p></div>)}
            </div>
          </div>
        </section>

        <section id="features" className="px-5 py-18 sm:px-8 sm:py-24"><div className="mx-auto max-w-6xl"><div className="max-w-xl"><p className="text-sm font-bold uppercase tracking-[0.14em] text-brand">Built to scale</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Everything starts with a trustworthy record.</h2></div><div className="mt-11 grid gap-5 md:grid-cols-3">{features.map(([title, text]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid size-10 place-items-center rounded-xl bg-brand-light text-lg text-brand">✦</div><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{text}</p></article>)}</div></div></section>
        <section className="mx-5 mb-18 rounded-3xl bg-brand px-6 py-14 text-center text-white sm:mx-8 sm:mb-24 sm:px-10"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Start recognizing achievement.</h2><p className="mx-auto mt-4 max-w-xl text-brand-light">Bring trust and polish to every certificate your organization issues.</p><ButtonLink to="/signup" variant="secondary" className="mt-8 border-white bg-white px-6 py-3.5 text-brand hover:bg-brand-light">Create your first certificate</ButtonLink></section>
      </main>
      <SiteFooter />
    </div>
  )
}
