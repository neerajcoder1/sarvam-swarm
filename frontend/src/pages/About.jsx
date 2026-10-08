import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Cpu, ShieldCheck, Zap, Layers, Activity, Mic, Sparkles, Server, Terminal } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SwarmLogo from '../components/SwarmLogo'

export default function About() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#09090b] text-[#a1a1aa] font-sans antialiased selection:bg-white/10 overflow-x-hidden">
      
      {/* ── Top Navigation Bar ── */}
      <nav className="fixed top-0 left-0 w-full px-4 sm:px-8 py-3.5 z-50 bg-[#09090b]/90 backdrop-blur-xl border-b border-[#1f2024] flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-[#71717a] hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
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
      <main className="max-w-[960px] mx-auto pt-24 sm:pt-28 px-4 sm:px-6 pb-20 relative z-10">
        
        {/* ── Hero Title ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-left space-y-3 border-b border-[#1f2024] pb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16171a] border border-[#27272a] text-[#a1a1aa] text-[11px] font-medium tracking-wider uppercase">
            <Sparkles size={12} className="text-[#a1a1aa]" />
            <span>System Architecture & Specs</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight font-sans">
            Sarvam Swarm Intelligence Engine
          </h1>
          <p className="text-xs sm:text-sm text-[#8e8f9a] leading-relaxed max-w-[640px]">
            A distributed sequential 5-agent execution pipeline engineered for zero-latency daily scheduling, biometric energy tracking, and localized voice narration.
          </p>
        </motion.div>

        {/* ── System Status Pill (Grok Style) ── */}
        <div className="mb-8 p-4 rounded-xl bg-[#141518] border border-[#222329] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-xs font-semibold text-white">Swarm Status: All Agents Operational</p>
              <p className="text-[11px] text-[#71717a]">Latency: &lt; 1.2s · Gemini 2.5 Flash Runtime</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#71717a]">
            <Server size={14} className="text-[#a1a1aa]" />
            <span>v1.0.0 (Build 2026.10)</span>
          </div>
        </div>

        {/* ── 5-Agent Pipeline Grid (Grok SaaS Style) ── */}
        <div className="mb-10 space-y-4">
          <h2 className="text-xs font-semibold text-[#71717a] uppercase tracking-widest pl-1">
            Sequential 5-Agent Architecture
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Agent 1 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#141518] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1c1d22] border border-[#2a2b32] flex items-center justify-center text-white">
                  <Brain size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">1. Orchestrator Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Intent Parsing & Domain Splitting</p>
                </div>
              </div>
              <p className="text-xs text-[#8e8f9a] leading-relaxed">
                Ingests raw prompt text, isolates priority constraints, and partitions task queue into 4 domains: Work, Energy, Errands, and Family.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#141518] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1c1d22] border border-[#2a2b32] flex items-center justify-center text-white">
                  <Activity size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">2. Personalization Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Biometrics & Health Signal Sync</p>
                </div>
              </div>
              <p className="text-xs text-[#8e8f9a] leading-relaxed">
                Evaluates sleep telemetry, HRV baselines, and historical energy dip patterns to adjust task placement and prevent burnout.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#141518] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1c1d22] border border-[#2a2b32] flex items-center justify-center text-white">
                  <Zap size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">3. Task Executor Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Time-Blocked Schedule Generation</p>
                </div>
              </div>
              <p className="text-xs text-[#8e8f9a] leading-relaxed">
                Constructs chronological task blocks with precise start times, mandatory 15-minute buffer zones, and calendar protection.
              </p>
            </div>

            {/* Agent 4 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#141518] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1c1d22] border border-[#2a2b32] flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">4. Recommendation Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Energy Boosters & Hydration</p>
                </div>
              </div>
              <p className="text-xs text-[#8e8f9a] leading-relaxed">
                Detects high-cognitive stress events and auto-injects hydration routines, light exercise, and protein snacks prior to big meetings.
              </p>
            </div>

            {/* Agent 5 */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#141518] border border-[#222329] hover:border-[#33343d] transition-colors flex flex-col justify-between gap-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1c1d22] border border-[#2a2b32] flex items-center justify-center text-white">
                  <Mic size={16} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white">5. Voice Narrator Agent</h3>
                  <p className="text-[11px] text-[#71717a]">Multilingual Colloquial Speech</p>
                </div>
              </div>
              <p className="text-xs text-[#8e8f9a] leading-relaxed">
                Synthesizes the plan into a companion-style verbal audio summary supporting English, Hindi, Hinglish, Tamil, Kannada, Telugu, Malayalam, Marathi, Gujarati, Punjabi, and Bengali.
              </p>
            </div>

          </div>
        </div>

        {/* ── Technical Specifications (Grok SaaS Style) ── */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#141518] border border-[#222329] space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal size={14} className="text-[#a1a1aa]" />
            <span>Core System Specs</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#8e8f9a]">
            <div>
              <p className="font-semibold text-white text-xs mb-1">Inference Engine</p>
              <p className="text-[11px] leading-relaxed">Gemini 2.5 Flash via Google GenAI SDK with 30s timeout architecture</p>
            </div>
            <div>
              <p className="font-semibold text-white text-xs mb-1">JSON Recovery</p>
              <p className="text-[11px] leading-relaxed">Regex brace-matching state machine to extract valid JSON objects from unstructured output</p>
            </div>
            <div>
              <p className="font-semibold text-white text-xs mb-1">Fault Tolerance</p>
              <p className="text-[11px] leading-relaxed">Multi-tiered prompt retry pipeline + deterministic offline fallback generators</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-[11px] text-[#4b4c56]">
          © 2026 Sarvam Swarm · Autonomous Personalized Life Co-Pilot Engine
        </footer>

      </main>
    </div>
  )
}