import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Cpu, Activity, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-orange-500/30 overflow-hidden">
      
      {/* Abstract Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full p-6 z-50 mix-blend-difference">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
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
            The next era of <br/><span className="text-orange-500">orchestration.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light max-w-[600px]">
            We are moving beyond simple chatbots into an ecosystem of autonomous, proactive, multi-agent systems designed to optimize human potential.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 auto-rows-[250px]">
          
          {/* Bento Item 1: Large Span */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-1 rounded-3xl bg-[#111111] border border-white/10 p-8 flex flex-col justify-between hover:border-orange-500/30 transition-colors group relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[50px] group-hover:bg-orange-500/10 transition-colors" />
            <div className="p-3 bg-white/5 w-fit rounded-xl border border-white/10 mb-4 text-orange-400">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Distributed Swarm Architecture</h3>
              <p className="text-white/50 leading-relaxed max-w-[400px]">
                Unlike standard LLMs, Swarm utilizes multiple expert sub-agents that collaborate securely in real-time to solve complex constraints.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-[#111111] border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-colors"
          >
            <div className="p-3 bg-white/5 w-fit rounded-xl border border-white/10 mb-4 text-blue-400">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Persistent Memory</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Secure PostgreSQL profiling learns your habits and optimal productivity hours over time.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-[#111111] border border-white/10 p-8 flex flex-col justify-between hover:border-white/20 transition-colors"
          >
            <div className="p-3 bg-white/5 w-fit rounded-xl border border-white/10 mb-4 text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-2">Privacy First</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Enterprise-grade OAuth limits scope access. Your calendar data remains completely yours.
              </p>
            </div>
          </motion.div>

          {/* Bento Item 4: Large Span */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 md:row-span-1 rounded-3xl bg-[#111111] border border-white/10 p-8 flex flex-col justify-between hover:border-blue-500/30 transition-colors relative overflow-hidden group"
          >
            <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[50px] group-hover:bg-blue-500/10 transition-colors" />
            <div className="p-3 bg-white/5 w-fit rounded-xl border border-white/10 mb-4 text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Predictive Wellness</h3>
              <p className="text-white/50 leading-relaxed max-w-[400px]">
                Burnout detection and intelligent workload balancing dynamically adjust your schedule to protect your mental and physical health.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Vision Statement */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter mb-8">
            Engineering intelligence.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70">
              <Zap size={14} className="text-orange-400" />
              Zero Latency Inference
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70">
              <RefreshCw size={14} className="text-blue-400" />
              Continuous Async Execution
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  )
}