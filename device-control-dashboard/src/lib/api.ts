import type { AuditEvent, DashboardSummary, Device, PairingCode, Session, TeamMember, Role } from '../types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '')
const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE ?? 'true').toLowerCase() === 'true'
const TOKEN_KEY = 'dcd_access_token'

export const authStore = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = authStore.getToken()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
  if (response.status === 401) {
    authStore.clear()
    throw new Error('Your session expired. Please sign in again.')
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { detail?: string } | null
    throw new Error(detail?.detail || `Request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

const demoDevices: Device[] = [
  { id: 'dev-1048', name: 'Warehouse Tablet 04', model: 'Samsung Galaxy Tab Active4 Pro', androidVersion: 'Android 14', status: 'Online', battery: 87, network: 'Wi-Fi · 5 GHz', lastSync: 'Just now', owner: 'Operations' },
  { id: 'dev-1047', name: 'Field Device 12', model: 'Google Pixel 8a', androidVersion: 'Android 15', status: 'Online', battery: 64, network: '5G · LTE fallback', lastSync: '2 min ago', owner: 'Field team' },
  { id: 'dev-1046', name: 'Front Desk', model: 'Samsung Galaxy A54', androidVersion: 'Android 14', status: 'Offline', battery: 31, network: 'Last: Wi-Fi', lastSync: '3 hours ago', owner: 'Reception' },
  { id: 'dev-1045', name: 'Inventory Scanner', model: 'Zebra TC58', androidVersion: 'Android 13', status: 'Online', battery: 92, network: 'Wi-Fi · 2.4 GHz', lastSync: '5 min ago', owner: 'Warehouse' },
  { id: 'dev-1044', name: 'Delivery Unit 08', model: 'Google Pixel 7', androidVersion: 'Android 14', status: 'Pending', battery: null, network: 'Not connected', lastSync: 'Never', owner: 'Logistics' },
  { id: 'dev-1043', name: 'Training Tablet', model: 'Lenovo Tab M10', androidVersion: 'Android 12', status: 'Offline', battery: 58, network: 'Last: Wi-Fi', lastSync: 'Yesterday', owner: 'Training' },
]
const demoAudit: AuditEvent[] = [
  { id: 'evt-8214', actor: 'Alex Morgan', action: 'Device synchronized', target: 'Warehouse Tablet 04', ip: '10.0.12.24', createdAt: '2026-10-18 08:42:15', result: 'Success' },
  { id: 'evt-8213', actor: 'Jordan Lee', action: 'Role updated', target: 'sam@company.test · Operator', ip: '10.0.12.19', createdAt: '2026-10-18 08:37:02', result: 'Success' },
  { id: 'evt-8212', actor: 'Unknown session', action: 'Login attempt', target: 'admin account', ip: '203.0.113.42', createdAt: '2026-10-18 08:31:40', result: 'Blocked' },
  { id: 'evt-8211', actor: 'Alex Morgan', action: 'Pairing code created', target: 'Enrollment · 10 min expiry', ip: '10.0.12.24', createdAt: '2026-10-18 08:26:12', result: 'Success' },
  { id: 'evt-8210', actor: 'Taylor Reed', action: 'Device revoked', target: 'Retired Device 02', ip: '10.0.12.31', createdAt: '2026-10-18 08:11:55', result: 'Success' },
]
const demoMembers: TeamMember[] = [
  { id: 'usr-01', name: 'Alex Morgan', email: 'alex@company.test', role: 'Owner', status: 'Active' },
  { id: 'usr-02', name: 'Jordan Lee', email: 'jordan@company.test', role: 'Administrator', status: 'Active' },
  { id: 'usr-03', name: 'Sam Patel', email: 'sam@company.test', role: 'Operator', status: 'Active' },
  { id: 'usr-04', name: 'Taylor Reed', email: 'taylor@company.test', role: 'Viewer', status: 'Invited' },
]

export const api = {
  get isDemoMode() { return DEMO_MODE },
  async login(email: string, password: string): Promise<Session> {
    if (DEMO_MODE) {
      if (!email.trim() || !password) throw new Error('Enter an email and password.')
      const session = { accessToken: 'demo-session-token', user: { id: 'usr-01', name: 'Alex Morgan', email, role: 'Owner' as Role } }
      authStore.setToken(session.accessToken)
      return session
    }
    const session = await request<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    authStore.setToken(session.accessToken)
    return session
  },
  async logout() {
    if (!DEMO_MODE) await request<void>('/auth/logout', { method: 'POST' }).catch(() => undefined)
    authStore.clear()
  },
  async summary(): Promise<DashboardSummary> {
    if (DEMO_MODE) return { totalDevices: demoDevices.length, onlineDevices: demoDevices.filter(d => d.status === 'Online').length, offlineDevices: demoDevices.filter(d => d.status === 'Offline').length, pendingDevices: demoDevices.filter(d => d.status === 'Pending').length }
    return request('/dashboard/summary')
  },
  async devices(): Promise<Device[]> { return DEMO_MODE ? demoDevices : request('/devices') },
  async device(id: string): Promise<Device> {
    if (DEMO_MODE) { const d = demoDevices.find(item => item.id === id); if (!d) throw new Error('Device not found'); return d }
    return request(`/devices/${encodeURIComponent(id)}`)
  },
  async revokeDevice(id: string): Promise<void> {
    if (DEMO_MODE) return
    return request(`/devices/${encodeURIComponent(id)}/revoke`, { method: 'POST' })
  },
  async createPairingCode(): Promise<PairingCode> {
    if (DEMO_MODE) return { code: String(Math.floor(100000 + Math.random() * 900000)), expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(), expiresInSeconds: 600 }
    return request('/enrollment/codes', { method: 'POST', body: JSON.stringify({ ttl_seconds: 600 }) })
  },
  async audit(): Promise<AuditEvent[]> { return DEMO_MODE ? demoAudit : request('/audit-logs') },
  async members(): Promise<TeamMember[]> { return DEMO_MODE ? demoMembers : request('/users') },
  async updateRole(id: string, role: Role): Promise<void> {
    if (DEMO_MODE) return
    return request(`/users/${encodeURIComponent(id)}/role`, { method: 'PATCH', body: JSON.stringify({ role }) })
  },
}
