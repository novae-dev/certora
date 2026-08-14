import { Link } from 'react-router-dom'
import { Brand } from './Brand'
import { ButtonLink } from './ButtonLink'

export function SiteHeader() {
  return (
    <header className="border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <a href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-ink">How it works</a>
          <a href="/#features" className="text-sm font-medium text-slate-600 hover:text-ink">Features</a>
          <Link to="/verify/demo-certificate" className="text-sm font-medium text-slate-600 hover:text-ink">Verify</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <ButtonLink to="/login" variant="ghost" className="px-2 sm:px-3">Log in</ButtonLink>
          <ButtonLink to="/signup" className="px-3 sm:px-4">Get started</ButtonLink>
        </div>
      </div>
    </header>
  )
}
