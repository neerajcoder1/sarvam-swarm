import { motion } from 'framer-motion'
import { Brain, X } from 'lucide-react'

export default function AgentTracePanel({ agent, onClose }) {
  if (!agent) return null

  return (
    <motion.div
      className="trace-panel-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="trace-panel-content"
        onClick={(e) => e.stopPropagation()} // Prevent close on panel click
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="trace-panel-header">
          <div className="trace-title">
            <Brain size={18} className="text-[#0EA5E9]" />
            <span>Agent Trace — {agent.name}</span>
          </div>
          <button
            type="button"
            className="trace-close-btn"
            onClick={onClose}
            aria-label="Close trace"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="trace-panel-body">
          <div className="trace-body-label">Internal State & Thoughts</div>
          <p className="trace-body-text">{agent.trace}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
