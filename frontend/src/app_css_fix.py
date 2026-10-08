with open("frontend/src/App.css", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Update main-input-bar
new_input_bar = """
.main-input-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 56px;
  padding: 0 1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 28px;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  width: 100%;
  max-width: 768px; /* maximum readable width */
  margin: 0 auto;
}

.main-input-bar:focus-within {
  border-color: var(--line-strong);
  /* Grok specifies no heavy chrome or glow */
}

.input-prefix-icon {
  color: var(--text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background 0.2s;
}

.input-prefix-icon:hover {
  background: var(--surface-hover);
  color: var(--text);
}

.main-input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--text);
  padding: 0.5rem 0;
}

.main-input-field::placeholder {
  color: var(--text-subtle);
}

/* Grok Primary Send Button */
.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover {
  opacity: 0.8;
}

/* Model Selector Chip */
.model-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  background: var(--surface-hover);
  border: 1px solid var(--line);
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.model-chip:hover {
  color: var(--text);
  border-color: var(--line-strong);
}

/* Global shadow resets based on Grok guidelines */
.swarm-agent-card, .day-plan-card, .task-item {
  box-shadow: none !important;
  border: 1px solid var(--line) !important;
  background: var(--surface) !important;
}

.swarm-agent-card:hover, .task-item:hover {
  transform: none !important;
  background: var(--surface-hover) !important;
  border-color: var(--line-strong) !important;
}

/* Accent Glow only on active */
.swarm-agent-card.active {
  border-color: var(--accent) !important;
  box-shadow: 0 0 20px var(--accent-ring), inset 0 0 0 1px var(--accent) !important;
}
"""

content = re.sub(r'\.main-input-bar \{.*?(?=\.action-btn \{)', new_input_bar, content, flags=re.DOTALL)

with open("frontend/src/App.css", "w", encoding="utf-8") as f:
    f.write(content)
