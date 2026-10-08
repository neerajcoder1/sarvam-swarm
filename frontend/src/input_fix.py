with open("frontend/src/pages/Dashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

new_input_bar = """<div className="main-input-bar relative">
                <button
                  type="button"
                  className="input-prefix-icon hover:text-[var(--text)] transition-colors cursor-pointer"
                  onClick={() => {
                    const el = document.getElementById('file-upload')
                    if (el) el.click()
                  }}
                  title="Attach or Share"
                >
                  <Plus size={20} />
                </button>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setInput(input + ` [Attached: ${e.target.files[0].name}] `)
                    }
                  }}
                />
                
                <input
                  type="text"
                  className="main-input-field focus:outline-none focus:ring-0 focus:border-transparent"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What do you want to know?"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartSwarm()}
                  disabled={isListening}
                />

                {/* Grok AI Model Chip */}
                <div className="model-chip hidden md:flex">
                  <Sparkles size={14} className="text-[var(--accent)]" />
                  <span>Swarm 2.0</span>
                </div>

                <button
                  type="button"
                  className={`text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex items-center justify-center p-2 ${isListening ? 'text-[var(--accent)] animate-pulse' : ''}`}
                  onClick={toggleListening}
                  title={isListening ? 'Listening...' : 'Voice Input'}
                >
                  <Mic size={20} />
                </button>

                <button
                  type="button"
                  className="send-btn"
                  onClick={() => handleStartSwarm()}
                >
                  <Send size={16} strokeWidth={2.5} />
                </button>
              </div>"""

content = re.sub(r'<div className="main-input-bar relative">.*?</button>\s*</div>', new_input_bar, content, flags=re.DOTALL)

with open("frontend/src/pages/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.write(content)
