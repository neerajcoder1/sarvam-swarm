import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Cpu, Activity, ShieldCheck, Zap, Layers, RefreshCw, Terminal, CheckCircle2, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)]/30 overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--line)]">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors uppercase tracking-widest text-xs font-bold"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </nav>

      <main className="max-w-[1200px] mx-auto pt-32 px-6 pb-24 relative z-10">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[800px] mb-24"
        >
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight mb-4 leading-tight">
            The next era of <br/><span className="text-[var(--accent)]">orchestration.</span>
          </h1>
          <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-[600px]">
            We are moving beyond simple chatbots into an ecosystem of autonomous, proactive, multi-agent systems designed to optimize human potential.
          </p>
        </motion.div>

        {/* How To Use Section (New Help Guide) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-32"
        >
          <h2 className="text-3xl font-bold tracking-tight mb-8 border-b border-[var(--line)] pb-4">How to Use Sarvam Swarm</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 flex flex-col gap-3">
              <div className="flex items-center gap-3 mb-2">
                <Terminal size={18} className="text-[var(--text)]" />
                <h3 className="text-base font-semibold text-[var(--text)]">1. Command the Swarm</h3>
              </div>
              <p className="text-[var(--text-muted)] text-[13px] leading-relaxed">
                Type requests like "Plan my day" or "Schedule a 30 min workout" into the main prompt bar. The Swarm automatically breaks your request into parallel tasks.
              </p>
            </div>

            <div className="p-6 flex flex-col gap-3 border-l border-[var(--line)]">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 size={18} className="text-[var(--text)]" />
                <h3 className="text-base font-semibold text-[var(--text)]">2. Sync to Calendar</h3>
              </div>
              <p className="text-[var(--text-muted)] text-[13px] leading-relaxed">
                Once the agents generate your timeline, click the green "Push to Google Calendar" button. We will automatically schedule push notifications and emails for you.
              </p>
            </div>

            <div className="p-6 flex flex-col gap-3 border-l border-[var(--line)]">
              <div className="flex items-center gap-3 mb-2">
                <Mic size={18} className="text-[var(--text)]" />
                <h3 className="text-base font-semibold text-[var(--text)]">3. Voice Orchestration</h3>
              </div>
              <p className="text-[var(--text-muted)] text-[13px] leading-relaxed">
                Click "Speak Plan" to hear the Voice Agent dynamically narrate your daily schedule back to you, complete with contextual wellness advice.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 auto-rows-[250px]">
          
          {/* Bento Item 1: Large Span */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-1 rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-6 md:p-8 flex flex-col justify-between hover:border-[var(--line-strong)] transition-colors group relative overflow-hidden"
          >
            <div className="flex items-center gap-3 mb-6">
              <Layers size={18} className="text-[var(--text)]" />
              <h3 className="text-base font-semibold">Distributed Swarm Architecture</h3>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-[13px] leading-relaxed max-w-[500px]">
                Unlike standard LLMs, Swarm utilizes multiple expert sub-agents that collaborate securely in real-time to solve complex constraints.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-6 md:p-8 flex flex-col justify-between hover:border-[var(--line-strong)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-6">
              <Cpu size={18} className="text-[var(--text)]" />
              <h3 className="text-base font-semibold">Persistent Memory</h3>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-[13px] leading-relaxed">
                Secure PostgreSQL profiling learns your habits and optimal productivity hours over time.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-6 md:p-8 flex flex-col justify-between hover:border-[var(--line-strong)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck size={18} className="text-[var(--text)]" />
              <h3 className="text-base font-semibold">Privacy First</h3>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-[13px] leading-relaxed">
                Enterprise-grade OAuth limits scope access. Your calendar data remains completely yours.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 4: Large Span */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-1 rounded-2xl bg-[var(--bg)] border border-[var(--line)] p-6 md:p-8 flex flex-col justify-between hover:border-[var(--line-strong)] transition-colors relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity size={18} className="text-[var(--text)]" />
              <h3 className="text-base font-semibold">Predictive Wellness</h3>
            </div>
            <div>
              <p className="text-[var(--text-muted)] text-[13px] leading-relaxed max-w-[500px]">
                Burnout detection and intelligent workload balancing dynamically adjust your schedule to protect your mental and physical health.
              </p>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  )
}