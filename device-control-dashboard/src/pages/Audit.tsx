import { useEffect, useMemo, useState } from 'react'
import { Download, FileSearch, ShieldAlert } from 'lucide-react'
import { api } from '../lib/api'
import type { AuditEvent } from '../types'
import { Button, Card, EmptyState, ErrorState, Loading, PageTitle, SearchField, StatusPill } from '../components/UI'

export default function Audit() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [query, setQuery] = useState('')
  const [result, setResult] = useState('All')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  async function load() { setBusy(true); setError(''); try { setEvents(await api.audit()) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load audit events') } finally { setBusy(false) } }
  useEffect(() => { void load() }, [])
  const filtered = useMemo(() => events.filter(e => (result === 'All' || e.result === result) && `${e.actor} ${e.action} ${e.target} ${e.ip} ${e.id}`.toLowerCase().includes(query.toLowerCase())), [events, query, result])
  function exportCsv() {
    const columns = ['id', 'actor', 'action', 'target', 'ip', 'createdAt', 'result'] as const
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = [columns.join(','), ...filtered.map(row => columns.map(c => escape(String(row[c] ?? ''))).join(','))].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a'); a.href = url; a.download = 'device-control-audit.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return <><PageTitle title="Audit logs" description="Search administrative actions, enrollment events, and security outcomes." action={<Button variant="secondary" onClick={exportCsv}><Download size={16} /> Export CSV</Button>} /><div className="mb-5 flex flex-col gap-3 sm:flex-row"><div className="w-full sm:max-w-sm"><SearchField value={query} onChange={setQuery} placeholder="Search actor, action, target, IP..." /></div><select value={result} onChange={e => setResult(e.target.value)} className="rounded-xl border border-white/10 bg-ink px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-teal-300/40"><option>All</option><option>Success</option><option>Blocked</option><option>Pending</option></select><div className="ml-auto self-center text-xs text-slate-500">{filtered.length} events</div></div>{busy ? <Loading /> : error ? <Card><ErrorState message={error} retry={() => void load()} /></Card> : <Card><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-[0.14em] text-slate-600"><th className="px-5 py-4 font-medium">Event</th><th className="px-4 py-4 font-medium">Actor</th><th className="px-4 py-4 font-medium">Target</th><th className="px-4 py-4 font-medium">IP address</th><th className="px-4 py-4 font-medium">Outcome</th><th className="px-5 py-4 font-medium">Timestamp</th></tr></thead><tbody>{filtered.map(e => <tr key={e.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]"><td className="px-5 py-4"><p className="text-sm font-medium text-slate-200">{e.action}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{e.id}</p></td><td className="px-4 py-4 text-sm text-slate-300">{e.actor}</td><td className="max-w-[200px] truncate px-4 py-4 text-xs text-slate-400">{e.target}</td><td className="px-4 py-4 font-mono text-xs text-slate-500">{e.ip}</td><td className="px-4 py-4"><StatusPill status={e.result} /></td><td className="px-5 py-4 text-xs text-slate-500">{e.createdAt}</td></tr>)}</tbody></table>{filtered.length === 0 && <EmptyState title="No matching events" description="Change your search or clear the outcome filter." />}</div></Card>}<div className="mt-5 flex gap-3 rounded-2xl border border-blue-300/10 bg-blue-300/[0.04] p-4"><FileSearch size={19} className="mt-0.5 shrink-0 text-blue-300" /><div><p className="text-sm font-medium text-blue-100">Audit integrity</p><p className="mt-1 text-xs leading-5 text-blue-100/60">Production audit records should be written server-side, timestamped in UTC, access-controlled, and protected against modification by ordinary workspace users.</p></div><ShieldAlert size={18} className="ml-auto mt-0.5 shrink-0 text-blue-200/60" /></div></>
}
