import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import SwarmLogo from '../components/SwarmLogo'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleToggle = () => {
    setIsLogin(!isLogin)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Login Flow (OAuth2 Form URL Encoded)
        const formBody = new URLSearchParams()
        formBody.append('username', formData.email) // OAuth2 expects email in 'username' field
        formBody.append('password', formData.password)

        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.detail || 'Login failed')
        
        localStorage.setItem('swarm_token', data.access_token)
        localStorage.setItem('swarm_email', data.email); localStorage.setItem('swarm_username', data.username)
        navigate('/')
      } else {
        // Register Flow
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.detail || 'Registration failed')
        
        // Auto-login after successful registration
        setIsLogin(true)
        setFormData({ ...formData, password: '' })
        setError('Registration successful! Please sign in.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg)] text-[var(--text)] px-4">
      <motion.div 
        className="w-full max-w-[400px] flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-10 text-center flex flex-col items-center">
          <SwarmLogo size={48} className="mb-6 opacity-90" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {isLogin ? 'Sign in to Swarm' : 'Create an account'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl focus:outline-none focus:border-[var(--line-strong)] transition-colors placeholder:text-[var(--text-subtle)]"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl focus:outline-none focus:border-[var(--line-strong)] transition-colors placeholder:text-[var(--text-subtle)]"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--line)] rounded-xl focus:outline-none focus:border-[var(--line-strong)] transition-colors placeholder:text-[var(--text-subtle)]"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />

          {error && (
            <p className={`text-sm ${error.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[var(--text)] text-[var(--bg)] font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
          </button>
        </form>

        <button 
          onClick={handleToggle}
          className="mt-6 text-sm text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </motion.div>
    </div>
  )
}
