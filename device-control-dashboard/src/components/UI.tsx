import type { ReactNode } from 'react'
import { LoaderCircle, Search, AlertCircle } from 'lucide-react'

export function PageTitle({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1><p className="mt-1.5 text-sm text-slate-400">{description}</p></div>{action && <div className="shrink-0">{action}</div>}</div>
}
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-white/[0.07] bg-panel shadow-glow ${className}`}>{children}</section>
}
export function Button({ children, onClick, variant = 'primary', disabled = false, type = 'button' }: { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; disabled?: boolean; type?: 'button' | 'submit' }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variant === 'primary' ? 'bg-teal-400 text-slate-950 hover:bg-teal-300' : variant === 'danger' ? 'border border-rose-400/20 bg-rose-400/10 text-rose-300 hover:bg-rose-400/15' : variant === 'ghost' ? 'text-slate-400 hover:bg-white/5 hover:text-white' : 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'}`}>{children}</button>
}
export function StatusPill({ status }: { status: string }) {
  const style = status === 'Online' || status === 'Success' || status === 'Active' ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20' : status === 'Offline' || status === 'Blocked' ? 'bg-rose-400/10 text-rose-300 ring-rose-400/20' : 'bg-amber-400/10 text-amber-300 ring-amber-400/20'
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>
}
export function SearchField({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-ink px-3 py-2.5 focus-within:border-teal-400/50"><Search size={16} className="shrink-0 text-slate-500" /><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" /></label>
}
export function Loading({ label = 'Loading data...' }: { label?: string }) {
  return <div className="flex items-center justify-center gap-2 py-14 text-sm text-slate-400"><LoaderCircle size={18} className="animate-spin text-teal-300" />{label}</div>
}
export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="flex flex-col items-center gap-3 py-12 text-center"><AlertCircle size={26} className="text-rose-300" /><p className="max-w-lg text-sm text-slate-300">{message}</p>{retry && <Button variant="secondary" onClick={retry}>Try again</Button>}</div>
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="py-12 text-center"><p className="font-medium text-white">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>
}
