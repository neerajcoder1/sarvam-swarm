import React, { useState, useRef, useEffect } from 'react'
import { Settings, HelpCircle, Zap, LogOut, Check, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { supabase } from '../lib/supabase'

export default function ProfileMenu({ userEmail, firstName, onOpenSettings }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setIsOpen(false)
    localStorage.removeItem('swarm_token')
    localStorage.removeItem('swarm_email')
    localStorage.removeItem('swarm_username')
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error("Supabase signOut error:", err)
    }
    window.location.href = '/auth'
  }

  return (
    <div className="relative w-full mt-2" ref={menuRef}>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 w-full mb-2 bg-[var(--surface)] border-[var(--line)] shadow-xl border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden z-50 py-2"
          >
            {/* Email Header */}
            <div className="px-4 py-3 border-b border-[var(--line)]">
              <p className="text-sm font-medium text-[var(--text-muted)] truncate">
                {userEmail || 'user@example.com'}
              </p>
            </div>

            {/* Active Account */}
            <div className="py-1 border-b border-[var(--line)]">
              <div className="w-full flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--surface-hover)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
                    <User size={12} className="text-[var(--text-muted)]" />
                  </div>
                  <span className="text-[13px] font-medium text-[var(--text)]">{firstName || 'User'}</span>
                </div>
                <Check size={13} className="text-[var(--text)]" />
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] text-sm" onClick={() => { setIsOpen(false); if (onOpenSettings) onOpenSettings(); }}>
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] text-sm" onClick={() => { setIsOpen(false); navigate('/about') }}>
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} />
                  <span>Help</span>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-muted)] hover:text-[var(--text)] text-sm" onClick={() => { setIsOpen(false); navigate('/upgrade') }}>
                <Zap size={16} />
                <span>Upgrade plan</span>
              </button>
            </div>
            
            <div className="border-t border-[var(--line)] py-2 flex flex-col gap-1">
              <div className="w-full flex items-center justify-between px-4 py-2 text-[var(--text-muted)] text-sm">
                <span>Theme</span>
                <ThemeToggle />
              </div>
              <button 
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 hover:text-red-400 transition-colors text-[var(--text-muted)] text-sm mt-1"
                onClick={handleSignOut}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--surface-hover)] transition-colors text-[var(--text)]"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
          <User size={15} className="text-[var(--text-muted)]" />
        </div>
        <span className="text-[13px] font-medium truncate flex-1 text-left">{firstName || 'User'}</span>
      </button>
    </div>
  )
}