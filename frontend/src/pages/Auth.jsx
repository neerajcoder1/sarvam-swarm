import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ArrowRight } from 'lucide-react'
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
        const formBody = new URLSearchParams()
        formBody.append('username', formData.email)
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
    <div className="flex flex-col min-h-screen bg-[#000000] text-white font-sans selection:bg-orange-500/30">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center p-6 w-full absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-3">
          <SwarmLogo size={28} className="opacity-90" />
        </div>
        <div className="flex items-center gap-3 text-[13px] text-white/50">
          <span>You are signing into</span>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-white/20 rounded-full hover:bg-white/10 transition-colors text-white">
            <span>Swarm</span>
            <ChevronDown size={14} className="text-white/50" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full px-6 mt-16">
        <motion.div 
          className="w-full max-w-[360px] flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-semibold tracking-tight mb-4 text-center">
            {isLogin ? 'Sign in to Swarm' : 'Create your account'}
          </h1>

          <p className="text-[11px] text-white/40 text-center mb-8 max-w-[300px] leading-relaxed">
            By continuing, you agree to Swarm's <span className="underline cursor-pointer hover:text-white/60">Terms of Service</span>, <span className="underline cursor-pointer hover:text-white/60">Privacy Policy</span>, and <span className="underline cursor-pointer hover:text-white/60">Cookie Policy</span>.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full"
                >
                  <input
                    type="text"
                    placeholder="Username"
                    className="w-full px-5 py-3.5 bg-transparent border border-white/20 rounded-full focus:outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/30 text-sm"
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
              className="w-full px-5 py-3.5 bg-transparent border border-white/20 rounded-full focus:outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/30 text-sm"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-5 py-3.5 bg-transparent border border-white/20 rounded-full focus:outline-none focus:border-white/60 transition-colors text-white placeholder:text-white/30 text-sm"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />

            {error && (
              <p className={`text-xs mt-1 text-center ${error.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 text-[15px]"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign in with Email' : 'Sign up with Email')}
            </button>
          </form>

          <div className="w-full flex items-center gap-4 my-6">
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Fake OAuth Buttons to match Grok Design */}
          <div className="w-full flex flex-col gap-3 mb-8">
            <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/20 rounded-full hover:bg-white/5 transition-colors text-[14px] font-medium text-white/90" onClick={(e) => e.preventDefault()}>
              <span className="w-4 h-4 rounded-full border border-white/50 flex items-center justify-center text-[10px] font-bold">A</span> 
              Continue with Apple
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/20 rounded-full hover:bg-white/5 transition-colors text-[14px] font-medium text-white/90" onClick={(e) => e.preventDefault()}>
              <span className="w-4 h-4 rounded-full border-[2px] border-blue-400 border-t-red-400 border-l-yellow-400 border-b-green-400"></span> 
              Continue with Google
            </button>
          </div>

          <button 
            onClick={handleToggle}
            className="text-[13px] text-white/50 hover:text-white transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
