with open("frontend/src/pages/Dashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# 1. Add state for chat history
state_addition = """
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_history')
    return saved ? JSON.parse(saved) : []
  })
  const [activeChatId, setActiveChatId] = useState(null)
"""

content = re.sub(r'const \[input, setInput\] = useState\(\'\'\)', state_addition + "\n  const [input, setInput] = useState('')", content)

# 2. Add save to history on successful swarm request
# Inside handleStartSwarm, after setting the view to 'results'
history_save = """
      // Save to history
      const newChat = {
        id: Date.now().toString(),
        title: queryToRun,
        tasks: data.tasks,
        date: new Date().toISOString()
      }
      setChatHistory(prev => {
        const updated = [newChat, ...prev]
        localStorage.setItem('swarm_chat_history', JSON.stringify(updated))
        return updated
      })
      setActiveChatId(newChat.id)
"""

content = re.sub(r'setView\(\'results\'\)\s*\} catch \(err\)', history_save + "\n      setView('results')\n    } catch (err)", content)

# 3. Add onSelectHistory handler
select_history = """
  const handleSelectHistory = (id) => {
    const chat = chatHistory.find(c => c.id === id)
    if (chat) {
      setActiveChatId(id)
      setTasksList(chat.tasks)
      setSwarmPhase('complete')
      setView('results')
      setSidebarOpen(false)
      if (window.innerWidth < 768) setSidebarCollapsed(true)
    }
  }
"""

content = re.sub(r'const handleBackToHome = \(\) => \{', select_history + "\n  const handleBackToHome = () => {", content)

# 4. Pass props to Sidebar
sidebar_props = """<Sidebar
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen((prev) => !prev)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          onSelectHistory={handleSelectHistory}"""

content = re.sub(r'<Sidebar\s+isOpen=\{sidebarOpen\}\s+onToggleOpen=\{[^\}]+\}\s+isCollapsed=\{sidebarCollapsed\}\s+onToggleCollapse=\{[^\}]+\}', sidebar_props, content)

with open("frontend/src/pages/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.write(content)
