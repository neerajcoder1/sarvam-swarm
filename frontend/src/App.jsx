import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import About from './pages/About'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('swarm_token')
  if (!token) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  useEffect(() => {
    const stored = localStorage.getItem('sarvam-swarm-theme')
    const dark = stored ? stored === 'dark' : true
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.classList.toggle('light', !dark)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
                <Route path="/about" element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
