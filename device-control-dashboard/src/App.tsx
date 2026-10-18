import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Devices from './pages/Devices'
import DeviceDetail from './pages/DeviceDetail'
import Enrollment from './pages/Enrollment'
import Users from './pages/Users'
import Audit from './pages/Audit'
import Settings from './pages/Settings'
import { api, authStore } from './lib/api'
import type { Session } from './types'

function getDemoSession(): Session | null {
  if (!authStore.getToken()) return null
  if (api.isDemoMode && authStore.getToken() === 'demo-session-token') return { accessToken: 'demo-session-token', user: { id: 'usr-01', name: 'Alex Morgan', email: 'admin@example.com', role: 'Owner' } }
  // Production sessions should be hydrated from a dedicated /auth/me endpoint.
  return null
}
export default function App() {
  const [session, setSession] = useState<Session | null>(() => getDemoSession())
  const navigate = useNavigate()
  function logout() { void api.logout(); setSession(null); navigate('/login') }
  return <Routes><Route path="/login" element={session ? <Navigate to="/" replace /> : <Login onLogin={s => { setSession(s); navigate('/') }} />} /><Route element={session ? <Layout session={session} onLogout={logout} /> : <Navigate to="/login" replace />}><Route index element={<Overview />} /><Route path="devices" element={<Devices />} /><Route path="devices/:id" element={<DeviceDetail />} /><Route path="enrollment" element={<Enrollment />} /><Route path="users" element={<Users />} /><Route path="audit" element={<Audit />} /><Route path="settings" element={<Settings />} /></Route><Route path="*" element={<Navigate to={session ? '/' : '/login'} replace />} /></Routes>
}
