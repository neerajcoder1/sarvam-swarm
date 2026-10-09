import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import About from './pages/About'
import Upgrade from './pages/Upgrade'
import ColdStartLoader from './components/ColdStartLoader'
import './App.css'

import { supabase } from './lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const PING_INTERVAL_MS = 3000

const ProtectedRoute = ({ children, authInitializing }) => {
  const token = localStorage.getItem('swarm_token')
  if (authInitializing) {
    return null // Allow Supabase to parse OAuth callback tokens before redirecting
  }
  if (!token) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  const [backendReady, setBackendReady] = useState(false)
  const [authInitializing, setAuthInitializing] = useState(true)

  useEffect(() => {
    // Check initial Supabase session on app mount (crucial for Google OAuth redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        localStorage.setItem('swarm_token', session.access_token)
        localStorage.setItem('swarm_email', session.user.email || 'user@example.com')
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        localStorage.setItem('swarm_username', name)
      }
      setAuthInitializing(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        localStorage.setItem('swarm_token', session.access_token)
        localStorage.setItem('swarm_email', session.user.email || 'user@example.com')
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        localStorage.setItem('swarm_username', name)
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('swarm_token')
        localStorage.removeItem('swarm_email')
        localStorage.removeItem('swarm_username')
      }
      setAuthInitializing(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('sarvam-swarm-theme')
    const dark = stored ? stored === 'dark' : true
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
  }, [])

  // ── Ping backend until it wakes up (cold-start detection) ────────────────
  useEffect(() => {
    let timer
    const ping = async () => {
      try {
        const res = await fetch(`${API_URL}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        })
        if (res.ok) {
          setBackendReady(true)
          return
        }
      } catch {
        // backend still sleeping — try again
      }
      timer = setTimeout(ping, PING_INTERVAL_MS)
    }
    ping()
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* ── Cold-start splash: overlays everything until backend wakes ── */}
      <AnimatePresence>
        {!backendReady && (
          <motion.div
            key="cold-loader"
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          >
            <ColdStartLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── App routes mount underneath (no flicker on reveal) ── */}
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute authInitializing={authInitializing}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute authInitializing={authInitializing}>
              <About />
            </ProtectedRoute>
          } />
          <Route path="/upgrade" element={
            <ProtectedRoute authInitializing={authInitializing}>
              <Upgrade />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
