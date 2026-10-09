import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Loader2 } from 'lucide-react'
import SwarmLogo from '../components/SwarmLogo'
import LegalModal from '../components/LegalModal'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [workspace, setWorkspace] = useState('Swarm Lite')
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [legalConfig, setLegalConfig] = useState({ isOpen: false, type: 'terms' })
  const navigate = useNavigate()

  React.useEffect(() => {
    if (localStorage.getItem('swarm_token')) {
      navigate('/', { replace: true })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        localStorage.setItem('swarm_token', session.access_token)
        localStorage.setItem('swarm_email', session.user.email || 'user@example.com')
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
        localStorage.setItem('swarm_username', name)
        navigate('/', { replace: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError('')
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

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
        const formBody = new URLSearchParams()
        formBody.append('username', formData.email)
        formBody.append('password', formData.password)

        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.detail || 'Login failed. Check email and password.')
        
        localStorage.setItem('swarm_token', data.access_token)
        localStorage.setItem('swarm_email', data.email)
        localStorage.setItem('swarm_username', data.username)
        navigate('/')
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username || formData.email.split('@')[0],
            email: formData.email,
            password: formData.password
          })
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.detail || 'Registration failed')
        
        setIsLogin(true)
        setFormData({ ...formData, password: '' })
        setError('✓ Account created successfully! Please sign in.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white font-sans selection:bg-white/20">
      
      {/* Top Header */}
      <header className="flex justify-between items-center px-6 py-5 w-full absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-3">
          <SwarmLogo size={26} className="opacity-90" />
          <span className="font-bold text-sm tracking-tight text-white">Sarvam Swarm</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/40 relative">
          <span>Environment</span>
          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-white text-xs font-medium bg-[#141518]"
          >
            <span>{workspace}</span>
            <ChevronDown size={13} className="text-white/40" />
          </button>

          <AnimatePresence>
            {isWorkspaceOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full right-0 mt-2 w-44 bg-[#141518] border border-[#222329] rounded-2xl shadow-2xl overflow-hidden py-1 z-50 text-xs"
              >
                {['Swarm Lite', 'Swarm Ultra', 'Enterprise'].map((env) => (
                  <button 
                    key={env}
                    onClick={() => { setWorkspace(env); setIsWorkspaceOpen(false) }}
                    className={`w-full text-left px-4 py-2 hover:bg-white/5 transition-colors flex justify-between items-center ${workspace === env ? 'text-white font-semibold' : 'text-white/60'}`}
                  >
                    <span>{env}</span>
                    {workspace === env && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Center Auth Card - Grok / ChatGPT SaaS Style */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-16">
        <motion.div 
          className="w-full max-w-[380px] bg-[#141518] border border-[#222329] rounded-3xl p-8 shadow-2xl flex flex-col items-center"
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo Badge */}
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <SwarmLogo size={24} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2 text-center text-white">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-xs text-white/40 text-center mb-8">
            {isLogin ? 'Sign in to access your autonomous swarm co-pilot' : 'Get started with Sarvam SwarmAssist today'}
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-3.5">
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full px-4 py-3 bg-[#09090b] border border-[#222329] rounded-2xl focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/30 text-xs"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-3 bg-[#09090b] border border-[#222329] rounded-2xl focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/30 text-xs"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 bg-[#09090b] border border-[#222329] rounded-2xl focus:outline-none focus:border-white/40 transition-colors text-white placeholder:text-white/30 text-xs"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {error && (
              <p className={`text-xs text-center py-1 ${error.includes('✓') ? 'text-emerald-400 font-medium' : 'text-red-400'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-white text-black font-semibold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 text-xs flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>
                  {isLogin ? 'Continue with Email' : 'Create Account'}
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 my-6">
            <div className="h-px bg-[#222329] flex-1" />
            <span className="text-[10px] uppercase font-mono text-white/30 tracking-widest">OR</span>
            <div className="h-px bg-[#222329] flex-1" />
          </div>

          {/* Google 1-Click Login Button - Grok / ChatGPT Style */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 bg-[#09090b] border border-[#222329] hover:border-white/30 rounded-2xl transition-colors text-xs font-medium text-white/90 hover:text-white"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle Mode */}
          <button 
            onClick={handleToggle}
            className="mt-6 text-xs text-white/40 hover:text-white transition-colors font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </motion.div>

        {/* Footer Legal Links */}
        <p className="text-[11px] text-white/30 text-center mt-8">
          By continuing, you agree to Swarm's{' '}
          <span onClick={() => setLegalConfig({ isOpen: true, type: 'terms' })} className="underline cursor-pointer hover:text-white/60">
            Terms
          </span>
          ,{' '}
          <span onClick={() => setLegalConfig({ isOpen: true, type: 'privacy' })} className="underline cursor-pointer hover:text-white/60">
            Privacy Policy
          </span>
          , and{' '}
          <span onClick={() => setLegalConfig({ isOpen: true, type: 'cookies' })} className="underline cursor-pointer hover:text-white/60">
            Cookies
          </span>
          .
        </p>
      </div>

      <LegalModal 
        isOpen={legalConfig.isOpen} 
        type={legalConfig.type} 
        onClose={() => setLegalConfig({ ...legalConfig, isOpen: false })} 
      />
    </div>
  )
}
