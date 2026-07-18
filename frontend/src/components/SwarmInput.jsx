import { Mic, Send } from 'lucide-react'

/** Mock voice/text input bar for triggering the swarm */
export default function SwarmInput({ value, onChange, onProcess, isProcessing, disabled }) {
  return (
    <div className="swarm-input-wrap">
      <div className="swarm-input-bar">
        <Mic size={18} className="swarm-input-bar__icon" />
        <input
          type="text"
          className="swarm-input-bar__field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hey Swarm, plan my day…"
          disabled={isProcessing || disabled}
        />
        <button
          type="button"
          className="swarm-input-bar__btn"
          onClick={onProcess}
          disabled={isProcessing || disabled || !value.trim()}
        >
          <Send size={14} />
          {isProcessing ? 'Processing…' : 'Process Input'}
        </button>
      </div>
      <p className="swarm-input-hint">
        Type or edit your request, then hit Process Input — swarm agents activate sequentially.
      </p>
    </div>
  )
}
