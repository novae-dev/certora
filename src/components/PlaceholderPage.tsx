import type { ReactNode } from 'react'
import { Brand } from './Brand'

type PlaceholderPageProps = { eyebrow: string; title: string; description: string; children?: ReactNode }

export function PlaceholderPage({ eyebrow, title, description, children }: PlaceholderPageProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_12px_40px_rgba(16,24,40,0.08)] sm:p-9">
        <Brand />
        <p className="mt-10 text-xs font-bold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        <p className="mt-3 leading-7 text-slate-600">{description}</p>
        {children}
      </section>
    </main>
  )
}
