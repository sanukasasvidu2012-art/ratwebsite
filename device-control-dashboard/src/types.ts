export type Role = 'Owner' | 'Administrator' | 'Operator' | 'Viewer'
export type DeviceStatus = 'Online' | 'Offline' | 'Pending'
export interface Device {
  id: string
  name: string
  model: string
  androidVersion: string
  status: DeviceStatus
  battery: number | null
  network: string
  lastSync: string
  owner: string
}
export interface DashboardSummary {
  totalDevices: number
  onlineDevices: number
  offlineDevices: number
  pendingDevices: number
}
export interface AuditEvent {
  id: string
  actor: string
  action: string
  target: string
  ip: string
  createdAt: string
  result: 'Success' | 'Blocked' | 'Pending'
}
export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  status: 'Active' | 'Invited'
}
export interface PairingCode {
  code: string
  expiresAt: string
  expiresInSeconds: number
}
export interface Session {
  accessToken: string
  user: { id: string; name: string; email: string; role: Role }
}
