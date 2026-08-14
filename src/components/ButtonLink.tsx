import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonLinkProps = { to: string; children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost'; className?: string }

const styles = {
  primary: 'bg-brand text-white shadow-sm hover:bg-brand-dark',
  secondary: 'border border-slate-200 bg-white text-ink hover:border-slate-300 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:text-ink',
}

export function ButtonLink({ to, children, variant = 'primary', className = '' }: ButtonLinkProps) {
  return <Link to={to} className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${styles[variant]} ${className}`}>{children}</Link>
}
