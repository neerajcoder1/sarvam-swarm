import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Upgrade() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col pt-16 px-6 pb-20">
      {/* Back Button */}
      <div className="w-full max-w-[1000px] mx-auto mb-12">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-lg">Back</span>
        </button>
      </div>

      <motion.div 
        className="max-w-[1000px] w-full mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Upgrade your Swarm</h1>
          <p className="text-xl text-[var(--text-muted)]">Experience the ultimate Life Co-Pilot with zero latency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
          {/* Free Tier */}
          <div className="flex flex-col p-8 rounded-3xl bg-[var(--bg)] border border-[var(--line)]">
            <h2 className="text-2xl font-semibold mb-2">Basic</h2>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold"></span>
              <span className="text-[var(--text-muted)]">/ month</span>
            </div>
            <p className="text-[var(--text-muted)] mb-8">For everyday scheduling and basic task management.</p>
            
            <button className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-[var(--surface-hover)] border border-[var(--line-strong)] mb-8 cursor-default">
              Current Plan
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-[var(--text-muted)] mt-0.5" />
                <span className="text-[var(--text-muted)]">Standard Swarm Intelligence</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-[var(--text-muted)] mt-0.5" />
                <span className="text-[var(--text-muted)]">Manual Google Calendar Sync</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-[var(--text-muted)] mt-0.5" />
                <span className="text-[var(--text-muted)]">Basic Voice Generation</span>
              </div>
              <div className="flex items-start gap-3 opacity-40">
                <X size={20} className="text-[var(--text-muted)] mt-0.5" />
                <span className="text-[var(--text-muted)]">Predictive Burnout Detection</span>
              </div>
              <div className="flex items-start gap-3 opacity-40">
                <X size={20} className="text-[var(--text-muted)] mt-0.5" />
                <span className="text-[var(--text-muted)]">Continuous Background Agents</span>
              </div>
            </div>
          </div>

          {/* Premium Tier */}
          <div className="flex flex-col p-8 rounded-3xl bg-[#1c1d21] border border-orange-500/30 hover:border-orange-500/60 transition-colors relative overflow-hidden shadow-2xl">
            {/* Subtle top border glow like ChatGPT Plus */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500" />
            
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                Sarvam <span className="bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text">Ultra</span>
              </h2>
              <Sparkles size={20} className="text-orange-400" />
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold"></span>
              <span className="text-[var(--text-muted)]">/ month</span>
            </div>
            <p className="text-[var(--text-muted)] mb-8">For power users who demand maximum performance.</p>
            
            <button className="w-full py-3 px-4 rounded-xl font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors mb-8 shadow-lg shadow-orange-900/50">
              Upgrade to Ultra
            </button>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Check size={20} className="text-white mt-0.5" />
                <span className="text-white">Everything in Basic, and:</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-orange-400 mt-0.5" />
                <span className="text-white">Zero-Latency Voice API</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-orange-400 mt-0.5" />
                <span className="text-white">Predictive Burnout Detection</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-orange-400 mt-0.5" />
                <span className="text-white">Continuous Background Agents</span>
              </div>
              <div className="flex items-start gap-3">
                <Check size={20} className="text-orange-400 mt-0.5" />
                <span className="text-white">Apple Watch / Garmin Sync</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}