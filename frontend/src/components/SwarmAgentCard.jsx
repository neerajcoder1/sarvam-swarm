import { motion } from 'framer-motion'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function SwarmAgentCard({
  agent,
  index,
  isVisible,
  isActive,
  isComplete,
  onSelect,
  isSelected,
}) {
  if (!isVisible) return null

  // Status mapping
  const getStatusText = () => {
    if (isComplete) return agent.doneStatus
    if (isActive) return agent.workingStatus
    return 'Pending activation...'
  }

  return (
    <motion.button
      type="button"
      className={`swarm-agent-card glass-panel ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''} ${isSelected ? 'border-[#0EA5E9] shadow-[0_0_10px_rgba(14,165,233,0.2)]' : ''}`}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(agent.id)}
      aria-label={`Agent details for ${agent.name}`}
    >
      <div className="flex justify-between items-center w-full">
        <span className="card-num">{String(index + 1).padStart(2, '0')}</span>
        <div className="card-status-icon">
          {isComplete ? (
            <CheckCircle2 size={16} />
          ) : isActive ? (
            <Loader2 size={16} className="swarm-spin" />
          ) : (
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--line-strong)]" />
          )}
        </div>
      </div>

      <h4 className="card-agent-name">{agent.name}</h4>
      <p className="card-agent-status">{getStatusText()}</p>
      
      <span className="card-trace-hint">
        Click to view agent trace →
      </span>
    </motion.button>
  )
}
