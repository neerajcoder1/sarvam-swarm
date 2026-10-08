import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar, Network, Database, Heart } from 'lucide-react'

export default function About() {
  const roadmapCards = [
    {
      icon: <Calendar size={20} className="text-[var(--accent)]" />,
      title: "Context awareness",
      desc: "Calendar sync, wearables, location & sleep-aware planning"
    },
    {
      icon: <Network size={20} className="text-[var(--accent)]" />,
      title: "Distributed swarm",
      desc: "Async DAG execution for concurrent agent reasoning"
    },
    {
      icon: <Database size={20} className="text-[var(--accent)]" />,
      title: "Persistent memory",
      desc: "PostgreSQL profiling & historical productivity analytics"
    },
    {
      icon: <Heart size={20} className="text-[var(--accent)]" />,
      title: "Predictive wellness",
      desc: "Burnout detection & adaptive intervention scheduling"
    }
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center pt-24 px-6 pb-20">
      <motion.div 
        className="max-w-[1000px] w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">About Sarvam Swarm</h1><button onClick={() => window.location.href = "/" } className="mt-4 px-4 py-2 bg-[var(--surface-hover)] hover:bg-[var(--line)] border border-[var(--line)] rounded-full text-sm font-semibold transition-colors">? Back to Dashboard</button>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            The next-generation Life Co-Pilot. We are moving beyond simple chatbots into an era of autonomous, proactive, multi-agent systems designed to optimize human potential.
          </p>
        </div>

        {/* Future Roadmap Section */}
        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-8 md:p-12 mt-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--line)]">
              <TrendingUp size={24} className="text-[var(--text)]" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Future roadmap</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roadmapCards.map((card, idx) => (
              <motion.div 
                key={idx}
                className="flex flex-col p-6 rounded-2xl bg-[var(--bg)] border border-[var(--line)] hover:border-[var(--line-strong)] transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="p-3 w-fit rounded-lg bg-[var(--surface)] mb-6 border border-[var(--line)]">
                  {card.icon}
                </div>
                <h3 className="font-bold text-lg mb-3">{card.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm italic text-[var(--text-muted)] max-w-3xl mx-auto leading-relaxed">
              Engineering intelligent productivity through collaborative AI agents, resilient system design, and human-centric wellness optimization.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
