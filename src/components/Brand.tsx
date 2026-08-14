import { Link } from 'react-router-dom'

export function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-ink" aria-label="Certora home">
      <span className="grid size-9 place-items-center rounded-xl bg-brand text-base font-bold text-white shadow-sm">C</span>
      <span className="text-xl font-semibold tracking-tight">Certora</span>
    </Link>
  )
}
