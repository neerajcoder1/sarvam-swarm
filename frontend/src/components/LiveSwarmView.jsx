import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Radio } from 'lucide-react'
import { SWARM_AGENTS, DEFAULT_SWARM_INPUT } from '../data/agents'
import SwarmInput from './SwarmInput'
import SwarmAgentCard from './SwarmAgentCard'
import AgentTracePanel from './AgentTracePanel'
import DayPlanOutput from './DayPlanOutput'

const AGENT_INTERVAL_MS = 1500

/**
 * Live Swarm Dashboard — sequential multi-agent orchestration view.
 * Agents appear every 1.5s; trace panel on click; final day plan at end.
 */
export default function LiveSwarmView({ onBack }) {
  const [input, setInput] = useState(DEFAULT_SWARM_INPUT)
  const [phase, setPhase] = useState('idle') // idle | running | complete
  const [visibleCount, setVisibleCount] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [completedSet, setCompletedSet] = useState(new Set())
  const [selectedId, setSelectedId] = useState(null)
  const [showVoice, setShowVoice] = useState(false)
  const timersRef = useRef([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const getStatusText = (agent, index) => {
    if (completedSet.has(agent.id)) return agent.doneStatus
    if (index === activeIndex) return agent.workingStatus
    if (index < visibleCount) return agent.workingStatus
    return agent.workingStatus
  }

  const selectedAgent = SWARM_AGENTS.find((a) => a.id === selectedId) ?? null

  const startSwarm = () => {
    if (phase === 'running') return
    clearTimers()
    setPhase('running')
    setVisibleCount(0)
    setActiveIndex(-1)
    setCompletedSet(new Set())
    setSelectedId(null)
    setShowVoice(false)

    SWARM_AGENTS.forEach((_, index) => {
      const appearTimer = setTimeout(() => {
        setVisibleCount(index + 1)
        setActiveIndex(index)

        const completeTimer = setTimeout(() => {
          setCompletedSet((prev) => new Set([...prev, SWARM_AGENTS[index].id]))

          if (index === SWARM_AGENTS.length - 1) {
            setActiveIndex(-1)
            setPhase('complete')
            setShowVoice(true)
            setSelectedId(SWARM_AGENTS[index].id)
          } else {
            setActiveIndex(index + 1)
          }
        }, AGENT_INTERVAL_MS - 200)

        timersRef.current.push(completeTimer)
      }, index * AGENT_INTERVAL_MS)

      timersRef.current.push(appearTimer)
    })
  }

  return (
    <motion.div
      className="live-swarm-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="live-swarm-view__top">
        <button type="button" className="swarm-back-btn" onClick={onBack}>
          <ArrowLeft size={15} />
          Back to Dashboard
        </button>
        <div className="live-swarm-badge">
          <Radio size={14} />
          <span>Live Swarm Dashboard</span>
          {phase === 'running' && <i className="live-dot" />}
        </div>
      </div>

      <div className="live-swarm-view__intro">
        <h2>Agent Swarm Orchestration</h2>
        <p>Your 5 life agents process requests sequentially — visible, traceable, autonomous.</p>
      </div>

      <SwarmInput
        value={input}
        onChange={setInput}
        onProcess={startSwarm}
        isProcessing={phase === 'running'}
        disabled={phase === 'complete'}
      />

      <div className="swarm-agents-grid">
        {SWARM_AGENTS.map((agent, index) => (
          <SwarmAgentCard
            key={agent.id}
            agent={agent}
            index={index}
            isVisible={index < visibleCount}
            isActive={index === activeIndex && phase === 'running'}
            isComplete={completedSet.has(agent.id)}
            statusText={getStatusText(agent, index)}
            onSelect={setSelectedId}
            isSelected={selectedId === agent.id}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {selectedAgent && (
          <AgentTracePanel
            key={selectedAgent.id}
            agent={selectedAgent}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'complete' && (
          <DayPlanOutput key="day-plan" showVoice={showVoice} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
