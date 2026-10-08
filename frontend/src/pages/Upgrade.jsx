import React from 'react'
import { motion } from 'framer-motion'
import { Crown, Zap, Shield, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Upgrade() {
  const navigate = useNavigate()
  
  const ultraFeatures = [
    "Unlimited Swarm Daily Invocations",
    "Continuous Background Task Monitoring",
    "Priority Voice API (Zero Latency Generation)",
    "Advanced Predictive Burnout Detection",
    "Deep Calendar Collision Resolving",
    "Smart Wearable Sync (Apple Watch / Garmin)"
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center pt-20 px-6 pb-20 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-1/2 translate-x-[-50%] w-[800px] h-[400px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Back Button */}
      <div className="w-full max-w-[900px] mb-8 z-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-full text-sm font-semibold transition-all w-fit"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <motion.div 
        className="max-w-[900px] w-full z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold text-sm mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Crown size={16} />
            <span>Coming Soon</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Sarvam <span className="bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 text-transparent bg-clip-text">Ultra</span>
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            The ultimate orchestration engine. Unlock the full power of continuous background agents and zero-latency execution.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="relative mx-auto max-w-[500px]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur opacity-20" />
          <div className="relative p-8 md:p-10 rounded-3xl bg-[var(--surface)] border border-[var(--line)] hover:border-purple-500/50 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ultra Tier</h2>
                <p className="text-[var(--text-muted)] text-sm">For power users and founders</p>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Sparkles size={24} />
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-8 border-b border-[var(--line)] pb-8">
              <span className="text-5xl font-extrabold"></span>
              <span className="text-[var(--text-muted)]">/ month</span>
            </div>

            <div className="flex flex-col gap-4 mb-10">
              {ultraFeatures.map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                >
                  <CheckCircle2 size={18} className="text-purple-400 flex-shrink-0" />
                  <span className="text-[var(--text)] font-medium text-sm md:text-base">{feature}</span>
                </motion.div>
              ))}
            </div>

            <button className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25">
              Join the Waitlist
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}