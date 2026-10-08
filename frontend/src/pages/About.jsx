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
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            The next era of <br/><span className="text-[var(--accent)]">orchestration.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--text-muted)] leading-relaxed font-light max-w-[600px]">
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
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <div className="p-3 bg-[var(--surface-hover)] w-fit rounded-xl border border-[var(--line-strong)] mb-4 text-[var(--accent)]">
                <Terminal size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">1. Command the Swarm</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Type requests like "Plan my day" or "Schedule a 30 min workout" into the main prompt bar. The Swarm automatically breaks your request into parallel tasks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <div className="p-3 bg-[var(--surface-hover)] w-fit rounded-xl border border-[var(--line-strong)] mb-4 text-green-500">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">2. Sync to Calendar</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Once the agents generate your timeline, click the green "Push to Google Calendar" button. We will automatically schedule push notifications and emails for you.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              <div className="p-3 bg-[var(--surface-hover)] w-fit rounded-xl border border-[var(--line-strong)] mb-4 text-purple-500">
                <Mic size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2">3. Voice Orchestration</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
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
            className="md:col-span-2 md:row-span-1 rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-8 flex flex-col justify-between hover:border-[var(--accent)] transition-colors group relative overflow-hidden"
          >
            <div className="p-3 bg-[var(--surface-hover)] w-fit rounded-xl border border-[var(--line-strong)] mb-4 text-[var(--accent)]">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Distributed Swarm Architecture</h3>
              <p className="text-[var(--text-muted)] leading-relaxed max-w-[400px]">
                Unlike standard LLMs, Swarm utilizes multiple expert sub-agents that collaborate securely in real-time to solve complex constraints.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-8 flex flex-col justify-between hover:border-[var(--line-strong)] transition-colors"
          >
            <div className="p-3 bg-[var(--surface-hover)] w-fit rounded-xl border border-[var(--line-strong)] mb-4 text-blue-500">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Persistent Memory</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Secure PostgreSQL profiling learns your habits and optimal productivity hours over time.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-8 flex flex-col justify-between hover:border-[var(--line-strong)] transition-colors"
          >
            <div className="p-3 bg-[var(--surface-hover)] w-fit rounded-xl border border-[var(--line-strong)] mb-4 text-emerald-500">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Privacy First</h3>
              <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                Enterprise-grade OAuth limits scope access. Your calendar data remains completely yours.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 4: Large Span */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-1 rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-8 flex flex-col justify-between hover:border-blue-500/50 transition-colors relative overflow-hidden group"
          >
            <div className="p-3 bg-[var(--surface-hover)] w-fit rounded-xl border border-[var(--line-strong)] mb-4 text-blue-500">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Predictive Wellness</h3>
              <p className="text-[var(--text-muted)] leading-relaxed max-w-[400px]">
                Burnout detection and intelligent workload balancing dynamically adjust your schedule to protect your mental and physical health.
              </p>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  )
}