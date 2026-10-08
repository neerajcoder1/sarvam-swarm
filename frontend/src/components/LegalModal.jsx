import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function LegalModal({ isOpen, onClose, type }) {
  if (!isOpen) return null

  const contentMap = {
    terms: {
      title: "Terms of Service",
      date: "Last updated: October 2026",
      body: "Welcome to Swarm. By using our autonomous orchestration services, you agree to these terms. Swarm acts as a Life Co-Pilot, utilizing distributed sub-agents to schedule, plan, and analyze your calendar data. You retain full ownership of your data. We do not sell your calendar history. Usage of the Swarm API is subject to rate limiting and fair use policies. Misuse of the autonomous agents to spam or overload third-party services will result in immediate termination."
    },
    privacy: {
      title: "Privacy Policy",
      date: "Last updated: October 2026",
      body: "Your privacy is our highest priority. Swarm utilizes enterprise-grade OAuth scopes to access your calendar. Our Orchestrator agent processes this data in volatile memory (RAM) during inference and does not persistently store your raw calendar events unless explicitly authorized for the Persistent Memory profile. All voice generation data is immediately discarded after synthesis."
    },
    cookies: {
      title: "Cookie Policy",
      date: "Last updated: October 2026",
      body: "We use essential cookies to maintain your authentication session and secure your connection. We do not use third-party tracking cookies or advertising pixels. By using Swarm, you consent to the storage of secure JWT tokens in your browser's local storage and session state."
    }
  }

  const content = contentMap[type] || contentMap.terms

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a0a] z-10">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{content.title}</h2>
              <p className="text-xs text-white/40 mt-1">{content.date}</p>
            </div>
            <button 
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <p className="text-sm text-white/70 leading-relaxed">
              {content.body}
            </p>
            <br />
            <p className="text-sm text-white/70 leading-relaxed">
              For complete legal documentation or compliance inquiries, please contact legal@sarvamswarm.ai.
            </p>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
            <button 
              className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              onClick={onClose}
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}