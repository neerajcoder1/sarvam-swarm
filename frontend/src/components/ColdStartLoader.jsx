import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Agent pipeline meta ────────────────────────────────────────────────────
const AGENTS = [
  { id: 'orchestrator',    label: 'Orchestrator',       emoji: '🧠' },
  { id: 'personalization', label: 'Personalization',    emoji: '🫀' },
  { id: 'task-executor',   label: 'Task Executor',      emoji: '⚡' },
  { id: 'recommendation',  label: 'Recommendation',     emoji: '💡' },
  { id: 'voice-narrator',  label: 'Voice Narrator',     emoji: '🎙️' },
]

// ─── Feature cards that rotate ──────────────────────────────────────────────
const FEATURES = [
  { icon: '🤖', title: '5 AI Agents in Sync',      desc: 'A sequential swarm handles intent, personalization, scheduling, wellness & narration.' },
  { icon: '🌐', title: 'Speaks 11 Languages',      desc: 'English, Hindi, Hinglish, Tamil, Kannada, Telugu, Malayalam, Marathi, Gujarati, Punjabi & Bengali.' },
  { icon: '💓', title: 'Biometric-Aware',           desc: 'Your HRV, sleep score & energy patterns shape every time-block generated for you.' },
  { icon: '🛡️', title: 'Fault-Tolerant by Design', desc: 'Multi-tier retry engine + fallback generator — your plan always arrives, no matter what.' },
  { icon: '🗓️', title: 'Time-Block Scheduling',    desc: 'Tasks get precise start times, 15-min transition buffers, and calendar-aware placement.' },
]

// ─── Hex SVG node ────────────────────────────────────────────────────────────
function HexNode({ cx, cy, r = 22, glowing, delay }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: 'backOut' }}
    >
      {glowing && (
        <motion.circle
          cx={cx} cy={cy} r={r + 8}
          fill="none"
          stroke="rgba(251,146,60,0.35)"
          strokeWidth="2"
          animate={{ r: [r + 6, r + 16, r + 6], opacity: [0.4, 0, 0.4] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        />
      )}
      <polygon
        points={hexPoints(cx, cy, r)}
        fill="rgba(255,255,255,0.04)"
        stroke={glowing ? '#fb923c' : 'rgba(255,255,255,0.15)'}
        strokeWidth={glowing ? 2 : 1}
        style={{ filter: glowing ? 'drop-shadow(0 0 6px #fb923c)' : 'none' }}
      />
      {glowing && (
        <polygon
          points={hexPoints(cx, cy, r - 8)}
          fill="rgba(251,146,60,0.12)"
        />
      )}
    </motion.g>
  )
}

function hexPoints(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

// ─── Animated connector line ─────────────────────────────────────────────────
function Connector({ x1, y1, x2, y2, delay }) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="rgba(251,146,60,0.4)"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
    />
  )
}

// ─── Swarm hex logo ───────────────────────────────────────────────────────────
function SwarmHexLogo() {
  const W = 160, H = 160, cx = 80, cy = 80, gap = 52
  const nodes = [
    { x: cx,        y: cy,        glow: true,  delay: 0   },
    { x: cx,        y: cy - gap,  glow: false, delay: 0.1 },
    { x: cx + gap * 0.87, y: cy - gap * 0.5, glow: false, delay: 0.15 },
    { x: cx + gap * 0.87, y: cy + gap * 0.5, glow: false, delay: 0.2 },
    { x: cx,        y: cy + gap,  glow: false, delay: 0.25 },
    { x: cx - gap * 0.87, y: cy + gap * 0.5, glow: false, delay: 0.3 },
    { x: cx - gap * 0.87, y: cy - gap * 0.5, glow: false, delay: 0.35 },
  ]
  const connectors = nodes.slice(1).map((n, i) => ({
    x1: cx, y1: cy, x2: n.x, y2: n.y, delay: 0.4 + i * 0.05
  }))

  return (
    <svg viewBox="0 0 160 160" width={160} height={160}>
      {connectors.map((c, i) => <Connector key={i} {...c} />)}
      {nodes.map((n, i) => (
        <HexNode key={i} cx={n.x} cy={n.y} glowing={n.glow} delay={n.delay} />
      ))}
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ColdStartLoader({ onReady }) {
  const [activeAgents, setActiveAgents]   = useState([])
  const [featureIndex, setFeatureIndex]   = useState(0)
  const [elapsed, setElapsed]             = useState(0)
  const [statusText, setStatusText]       = useState('Waking up your AI Swarm…')

  const STATUS_STEPS = [
    { at: 0,  text: 'Waking up your AI Swarm…'      },
    { at: 8,  text: 'Loading agent pipeline…'        },
    { at: 18, text: 'Connecting to Gemini 2.5 Flash…'},
    { at: 30, text: 'Almost ready…'                  },
    { at: 50, text: 'Hang tight — cold start in progress…' },
    { at: 70, text: 'The swarm is warming up…'       },
    { at: 90, text: 'Final checks…'                  },
  ]

  // ── reveal agents one by one ─────────────────────────────────────────────
  useEffect(() => {
    AGENTS.forEach((agent, i) => {
      setTimeout(() => {
        setActiveAgents(prev => [...prev, agent.id])
      }, 800 + i * 700)
    })
  }, [])

  // ── rotate feature cards ─────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setFeatureIndex(i => (i + 1) % FEATURES.length)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  // ── elapsed timer + status text updates ──────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(t => {
        const next = t + 1
        const step = [...STATUS_STEPS].reverse().find(s => next >= s.at)
        if (step) setStatusText(step.text)
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const feature = FEATURES[featureIndex]

  return (
    <div className="cold-loader-root">
      {/* ── Animated grid background ── */}
      <div className="cold-loader-grid" />

      {/* ── Floating orb glow ── */}
      <div className="cold-loader-orb" />

      <div className="cold-loader-content">

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="cold-loader-logo-wrap"
        >
          <SwarmHexLogo />
        </motion.div>

        {/* ── Brand name ── */}
        <motion.h1
          className="cold-loader-brand"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          SwarmAssist
        </motion.h1>

        {/* ── Dynamic status ── */}
        <AnimatePresence mode="wait">
          <motion.p
            key={statusText}
            className="cold-loader-status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
          >
            {statusText}
          </motion.p>
        </AnimatePresence>

        {/* ── Agent pills ── */}
        <div className="cold-loader-agents">
          {AGENTS.map((agent) => (
            <AnimatePresence key={agent.id}>
              {activeAgents.includes(agent.id) && (
                <motion.span
                  className="cold-loader-pill"
                  initial={{ opacity: 0, scale: 0.7, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'backOut' }}
                >
                  <span className="cold-loader-pill-dot" />
                  {agent.emoji} {agent.label}
                </motion.span>
              )}
            </AnimatePresence>
          ))}
        </div>

        {/* ── Progress bar ── */}
        <div className="cold-loader-bar-track">
          <motion.div
            className="cold-loader-bar-fill"
            initial={{ width: '0%' }}
            animate={{ width: '92%' }}
            transition={{ duration: 90, ease: 'easeInOut' }}
          />
          {/* shimmer */}
          <div className="cold-loader-bar-shimmer" />
        </div>

        {/* ── Timer ── */}
        <p className="cold-loader-timer">
          {elapsed}s elapsed
        </p>

        {/* ── Rotating feature card ── */}
        <div className="cold-loader-feature-wrap">
          <AnimatePresence mode="wait">
            <motion.div
              key={featureIndex}
              className="cold-loader-feature-card"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45 }}
            >
              <span className="cold-loader-feature-icon">{feature.icon}</span>
              <div>
                <p className="cold-loader-feature-title">{feature.title}</p>
                <p className="cold-loader-feature-desc">{feature.desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* dot indicators */}
          <div className="cold-loader-dots">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                className={`cold-loader-dot ${i === featureIndex ? 'active' : ''}`}
                onClick={() => setFeatureIndex(i)}
                aria-label={`Feature ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* ── Footer tip ── */}
      <motion.p
        className="cold-loader-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        ☁️ Free tier cold start — usually takes <strong>30–90s</strong>. Sit back!
      </motion.p>
    </div>
  )
}
