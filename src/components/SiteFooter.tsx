import { Brand } from './Brand'

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-9 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div><Brand /><p className="mt-3 text-sm text-slate-500">Digital certificates, made trustworthy.</p></div>
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Certora. All rights reserved.</p>
      </div>
    </footer>
  )
}
