import React, { useState, useRef, useEffect } from 'react'
import { Settings, HelpCircle, Zap, LogOut, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function ProfileMenu({ userEmail, firstName }) {
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

  return (
    <div className="relative w-full mt-2" ref={menuRef}>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 w-full mb-2 bg-[#1a1a1c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 py-2"
          >
            {/* Email Header */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-sm font-medium text-white/50 truncate">
                {userEmail || 'user@example.com'}
              </p>
            </div>

            {/* Account Switcher Mock */}
            <div className="py-2 border-b border-white/10">
              <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                    {firstName ? firstName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-white">{firstName || 'User'}</span>
                </div>
                <Check size={14} className="text-white" />
              </button>
              
              <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white/50 flex items-center justify-center text-xs font-bold">
                    N
                  </div>
                  <span className="text-sm font-medium text-white/50">Neeraj</span>
                </div>
              </button>
            </div>

            {/* Menu Links */}
            <div className="py-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-white/80 hover:text-white text-sm" onClick={() => { setIsOpen(false); alert("Settings coming in Phase 2!") }}>
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors text-white/80 hover:text-white text-sm" onClick={() => { setIsOpen(false); navigate('/about') }}>
                <div className="flex items-center gap-3">
                  <HelpCircle size={16} />
                  <span>Help</span>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-white/80 hover:text-white text-sm" onClick={() => { setIsOpen(false); navigate('/upgrade') }}>
                <Zap size={16} />
                <span>Upgrade plan</span>
              </button>
            </div>
            
            <div className="border-t border-white/10 py-2">
              <button 
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-500/10 hover:text-red-400 transition-colors text-white/80 text-sm"
                onClick={() => {
                  localStorage.removeItem('swarm_token')
                  localStorage.removeItem('swarm_email')
                  window.location.href = '/'
                }}
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
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
          {firstName ? firstName[0].toUpperCase() : 'U'}
        </div>
        <span className="text-sm font-semibold text-white truncate">{firstName || 'User'}</span>
      </button>
    </div>
  )
}