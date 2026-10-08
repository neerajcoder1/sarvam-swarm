import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Network, Database, Heart, ArrowLeft, Target, Shield, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()
  
  const roadmapCards = [
    {
      icon: <Calendar size={20} className="text-[var(--accent)]" />,
      title: "Deep Context Awareness",
      desc: "Full two-way Calendar sync, wearable integrations, and location-aware proactive scheduling."
    },
    {
      icon: <Network size={20} className="text-[var(--accent)]" />,
      title: "Distributed Swarm",
      desc: "Async task execution utilizing concurrent reasoning agents for complex multi-step workflows."
    },
    {
      icon: <Database size={20} className="text-[var(--accent)]" />,
      title: "Persistent Memory",
      desc: "Secure PostgreSQL-backed profiling to learn your habits, routines, and optimal productivity hours."
    },
    {
      icon: <Heart size={20} className="text-[var(--accent)]" />,
      title: "Predictive Wellness",
      desc: "Burnout detection and intelligent workload balancing to maintain your mental and physical health."
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center pt-20 px-6 pb-20">
      
      {/* Back Button */}
      <div className="w-full max-w-[1000px] mb-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-full text-sm font-semibold transition-all w-fit"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>

      <motion.div 
        className="max-w-[1000px] w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
            Sarvam Swarm
          </h1>
          <p className="text-xl text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
            We are moving beyond simple chatbots into an era of autonomous, proactive, multi-agent systems. Sarvam Swarm is your personal, intelligent Life Co-Pilot engineered to optimize human potential.
          </p>
        </div>

        {/* Why We Built This Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] hover:border-blue-500/30 transition-all flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-blue-500/10 mb-6 text-blue-400">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-[var(--text-muted)]">To eliminate decision fatigue by delegating schedule planning and daily task orchestration to a hyper-intelligent swarm of specialized AI agents.</p>
          </div>
          
          <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] hover:border-indigo-500/30 transition-all flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-indigo-500/10 mb-6 text-indigo-400">
              <Zap size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">The Architecture</h3>
            <p className="text-[var(--text-muted)]">Unlike standard LLMs, Swarm utilizes multiple expert sub-agents (Orchestrator, Execution, Voice) that collaborate securely in real-time to solve complex constraints.</p>
          </div>

          <div className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] hover:border-purple-500/30 transition-all flex flex-col items-center text-center">
            <div className="p-4 rounded-full bg-purple-500/10 mb-6 text-purple-400">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3">Privacy First</h3>
            <p className="text-[var(--text-muted)]">Your data belongs to you. By utilizing secure enterprise-grade OAuth architectures and strict environment separation, your personal calendar data is fully protected.</p>
          </div>
        </div>

        {/* Future Roadmap Section */}
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-8 md:p-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--line)]">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">The Future Roadmap</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmapCards.map((card, idx) => (
              <motion.div 
                key={idx}
                className="flex flex-col p-6 rounded-2xl bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--line)]">
                    {card.icon}
                  </div>
                  <h3 className="font-bold text-lg">{card.title}</h3>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center mb-8">
            <p className="text-sm font-semibold tracking-widest uppercase text-[var(--text-muted)]">
              Ac 2026 Sarvam Swarm Lite
            </p>
        </div>
        
      </motion.div>
    </div>
  )
}