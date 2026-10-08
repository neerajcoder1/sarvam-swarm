import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Cpu, ShieldCheck, Zap, Layers, Activity, Mic, CheckCircle2, Sparkles, Server, Terminal, Radio } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SwarmLogo from '../components/SwarmLogo'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#08080a] text-white selection:bg-orange-500/30 font-sans overflow-x-hidden">
      
      {/* ── Fixed Top Navigation Bar ── */}
      <nav className="fixed top-0 left-0 w-full px-4 sm:px-8 py-3.5 z-50 bg-[#08080a]/90 backdrop-blur-xl border-b border-[#1f2026] flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-[#9496a1] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Swarm</span>
        </button>

        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/')}
          title="Swarm Home"
        >
          <div className="w-8 h-8 rounded-full bg-[#16171a] border border-[#27272a] flex items-center justify-center text-white">
            <SwarmLogo size={18} />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">SwarmAssist</span>
        </div>
      </nav>

      {/* ── Main Container ── */}
      <main className="max-w-[1000px] mx-auto pt-24 sm:pt-28 px-4 sm:px-6 pb-20 relative z-10">
        
        {/* ── Hero Title ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-left space-y-3 border-b border-[#1e1f26] pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles size={12} />
            <span>System Architecture & PRD</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Sarvam Swarm Intelligence Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#9496a1] leading-relaxed max-w-[680px]">
            A sequential multi-agent execution pipeline engineered for zero-latency daily scheduling, biometric energy balancing, and localized audio narration.
          </p>
        </motion.div>

        {/* ── System Status Pill ── */}
        <div className="mb-10 p-4 rounded-2xl bg-[#121316] border border-[#222329] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-semibold text-white">Swarm Status: All Agents Operational</p>
              <p className="text-[11px] text-[#71717a]">Latency: &lt; 1.2s · Gemini 2.5 Flash Client</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#8e8f9a]">
            <Server size={14} className="text-indigo-400" />
            <span>v1.0.0 (Build 2026.10)</span>
          </div>
        </div>

        {/* ── 5-Agent Pipeline Grid (Grok Style) ── */}
        <div className="mb-12 space-y-4">
          <h2 className="text-sm font-bold text-[#8e8f9a] uppercase tracking-wider pl-1">
            Sequential 5-Agent Architecture
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Agent 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Brain size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">1. Orchestrator Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Intent Parsing & Domain Splitting</p>
                </div>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Ingests raw prompt text, isolates priority constraints, and partitions task queue into 4 domains: Work, Energy, Errands, and Family.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">2. Personalization Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Biometrics & Health Signal Sync</p>
                </div>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Evaluates sleep telemetry, HRV baselines, and historical energy dip patterns to adjust task placement and prevent burnout.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">3. Task Executor Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Time-Blocked Schedule Generation</p>
                </div>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Constructs chronological task blocks with precise start times, mandatory 15-minute buffer zones, and calendar protection.
              </p>
            </div>

            {/* Agent 4 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">4. Recommendation Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Energy Boosters & Hydration</p>
                </div>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Detects high-cognitive stress events and auto-injects hydration routines, light exercise, and protein snacks prior to big meetings.
              </p>
            </div>

            {/* Agent 5 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#121316] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Mic size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">5. Voice Narrator Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Multilingual Colloquial Speech</p>
                </div>
              </div>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Synthesizes the plan into a companion-style verbal audio summary supporting English, Hindi, Hinglish, Tamil, Kannada, Telugu, Malayalam, Marathi, Gujarati, Punjabi, and Bengali.
              </p>
            </div>

          </div>
        </div>

        {/* ── Technical Specifications ── */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#121316] border border-[#222329] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Terminal size={16} className="text-orange-400" />
            <span>Core System Specs</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#9496a1]">
            <div>
              <p className="font-semibold text-white mb-1">Inference Engine</p>
              <p className="text-[11px]">Gemini 2.5 Flash via Google GenAI SDK with 30s timeout architecture</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">JSON Recovery</p>
              <p className="text-[11px]">Regex brace-matching state machine to extract valid JSON objects from unstructured output</p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Fault Tolerance</p>
              <p className="text-[11px]">Multi-tiered prompt retry pipeline + deterministic offline fallback generators</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-[11px] text-[#555660]">
          © 2026 Sarvam Swarm · Autonomous Personalized Life Co-Pilot Engine
        </footer>

      </main>
    </div>
  )
}