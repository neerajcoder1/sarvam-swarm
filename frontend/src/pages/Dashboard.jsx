import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Send, Sparkles, Brain, Volume2, Play, Square, Info } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import SwarmAgentCard from '../components/SwarmAgentCard'
import AgentTracePanel from '../components/AgentTracePanel'
import DayPlanOutput from '../components/DayPlanOutput'
import { SWARM_AGENTS, DAY_PLAN_TASKS, VOICE_NARRATION } from '../data/agents'
const QUICK_SUGGESTIONS = [
  "Plan my day",
  "What's my schedule today?",
  "Suggest a healthy lunch near me",
  "Add 30 min break",
  "Tell me about my tasks"
]

export default function Dashboard() {
  const [view, setView] = useState('homepage') // 'homepage' | 'dashboard'
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [swarmPhase, setSwarmPhase] = useState('idle') // 'idle' | 'running' | 'complete'
  const [visibleCount, setVisibleCount] = useState(0)
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1)
  const [completedAgents, setCompletedAgents] = useState(new Set())
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [speechActive, setSpeechActive] = useState(false)
  
  const [agentsData, setAgentsData] = useState(SWARM_AGENTS)
  const [tasksData, setTasksData] = useState(DAY_PLAN_TASKS)
  const [voiceNarrationData, setVoiceNarrationData] = useState(VOICE_NARRATION)

  const recognitionRef = useRef(null)
  const bottomRef = useRef(null)
  const timersRef = useRef([])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    return () => {
      clearTimers()
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (swarmPhase === 'complete') {
      const scrollTimer = setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }, 350)
      return () => clearTimeout(scrollTimer)
    }
  }, [swarmPhase])

  // Web Speech API Voice Recognition
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      // Fallback simulated voice typing
      if (isListening) return
      setIsListening(true)
      
      const simulatedText = "Hey Swarm, plan my day. I have a presentation at 3 PM, feeling low on energy."
      let currentIndex = 0
      
      const typingTimer = setInterval(() => {
        if (currentIndex < simulatedText.length) {
          setInput(simulatedText.substring(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typingTimer)
          setIsListening(false)
          // Automatically trigger submit
          setTimeout(() => {
            handleStartSwarm(simulatedText)
          }, 600)
        }
      }, 40)
      
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      try {
        const recognition = new SpeechRecognition()
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Indian English accent context

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          handleStartSwarm(transcript)
        }

        recognition.onerror = (err) => {
          console.error('Speech recognition error:', err)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
        recognition.start()
      } catch (err) {
        console.error('Failed to start speech recognition:', err)
        setIsListening(false)
      }
    }
  }

  // Trigger Swarm flow with FastAPI integration
  const handleStartSwarm = async (queryText = input) => {
    if (!queryText.trim()) return
    
    // First transition to loading view
    setView('loading')
    setSwarmPhase('idle')
    clearTimers()

    let activeData = {
      agents: SWARM_AGENTS,
      tasks: DAY_PLAN_TASKS,
      voice_narration: VOICE_NARRATION
    }

    try {
      const response = await fetch('http://localhost:8000/api/swarm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText }),
      })

      if (response.ok) {
        const parsed = await response.json()
        if (parsed && parsed.agents && parsed.tasks) {
          activeData = parsed
          console.log("Successfully retrieved data from FastAPI:", parsed)
        }
      } else {
        console.warn("Backend returned error status, using default mock data.")
      }
    } catch (err) {
      console.error("Failed to fetch from backend, using default mock data:", err)
    }

    // Set updated data in state
    setAgentsData(activeData.agents)
    setTasksData(activeData.tasks)
    setVoiceNarrationData(activeData.voice_narration)

    // Staggered sequential simulation using loaded agent list
    const startTimer = setTimeout(() => {
      setView('dashboard')
      setSwarmPhase('running')
      setVisibleCount(0)
      setActiveAgentIndex(-1)
      setCompletedAgents(new Set())
      setSelectedAgentId(null)

      // Sequential staggered execution (1.2 seconds delay per agent card)
      activeData.agents.forEach((agent, index) => {
        const appearTimer = setTimeout(() => {
          setVisibleCount(index + 1)
          setActiveAgentIndex(index)

          const completeTimer = setTimeout(() => {
            setCompletedAgents((prev) => {
              const next = new Set(prev)
              next.add(agent.id)
              return next
            })

            if (index === activeData.agents.length - 1) {
              setActiveAgentIndex(-1)
              setSwarmPhase('complete')
              // Automatically play the customized Hinglish voice narration
              triggerVoiceSpeech(activeData.voice_narration)
            } else {
              setActiveAgentIndex(index + 1)
            }
          }, 1000) // complete slightly before next agent starts

          timersRef.current.push(completeTimer)
        }, index * 1200)

        timersRef.current.push(appearTimer)
      })
    }, 1500) // Transition loading -> dashboard in 1.5 seconds

    timersRef.current.push(startTimer)
  }

  const triggerVoiceSpeech = (textToSpeak = voiceNarrationData) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'hi-IN' // Hinglish voice context
      utterance.rate = 0.95
      utterance.onstart = () => setSpeechActive(true)
      utterance.onend = () => setSpeechActive(false)
      utterance.onerror = () => setSpeechActive(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopVoiceSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setSpeechActive(false)
    }
  }

  const handleBackToHome = () => {
    clearTimers()
    stopVoiceSpeech()
    setView('homepage')
    setSwarmPhase('idle')
    setVisibleCount(0)
    setActiveAgentIndex(-1)
    setCompletedAgents(new Set())
    setSelectedAgentId(null)
    setInput('')
  }

  const activeAgent = agentsData.find((a) => a.id === selectedAgentId)

  return (
    <div className="app-container">
      {/* Background Animated Wallpaper */}
      <div className="grid-overlay" aria-hidden="true" />
      <div className="glow-orb glow-orb-1" aria-hidden="true" />
      <div className="glow-orb glow-orb-2" aria-hidden="true" />
      <div className="glow-orb glow-orb-3" aria-hidden="true" />

      <AnimatePresence mode="wait">
        {view === 'homepage' ? (
          <motion.div
            key="homepage-view"
            className="homepage-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute top-6 right-6">
              <ThemeToggle />
            </div>

            <motion.div
              className="input-container-centered"
              initial={{ y: 0, opacity: 1 }}
              exit={{ y: 350, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.35, 1] }}
            >
              {/* Quick Suggestions Bar */}
              <div className="suggestions-container">
                <span className="suggestions-title">Try these commands</span>
                <div className="suggestions-list">
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="suggestion-button"
                      onClick={() => {
                        setInput(suggestion)
                        handleStartSwarm(suggestion)
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="main-input-bar">
                <input
                  type="text"
                  className="main-input-field"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="+ What do you want to know?"
                  onKeyDown={(e) => e.key === 'Enter' && handleStartSwarm()}
                  disabled={isListening}
                />
                
                {isListening && (
                  <span className="voice-status-label animate-pulse">Voice Input</span>
                )}

                <button
                  type="button"
                  className={`mic-button-glow ${isListening ? 'recording' : ''}`}
                  onClick={toggleListening}
                  title={isListening ? 'Listening...' : 'Voice Input'}
                >
                  <Mic size={22} />
                </button>

                {input.trim() && (
                  <button
                    type="button"
                    className="send-button"
                    onClick={() => handleStartSwarm()}
                    title="Send Request"
                  >
                    <Send size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : view === 'loading' ? (
          <motion.div
            key="loading-view"
            className="loading-overlay-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="loading-center-content">
              <div className="premium-loader-rings">
                <div className="loader-ring loader-ring-outer" />
                <div className="loader-ring loader-ring-inner" />
                <Brain className="loader-icon-center text-indigo-400" size={24} />
              </div>
              <div className="typing-text-wrapper">
                <p className="typing-text">Swarm is planning your day...</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full flex flex-col"
          >
            {/* Header */}
            <header className="dashboard-header">
              <div className="logo-group">
                <div className="logo-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-users-icon lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <span className="logo-text">Sarvam Swarm</span>
              </div>

              <div className="header-actions">
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="px-4 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
                >
                  Reset Dashboard
                </button>
                <ThemeToggle />
              </div>
            </header>

            {/* Main Area */}
            <main className="dashboard-main-content">
              <div className="swarm-orchestration-section">
                <div className="section-title-group">
                  <h2>Life Agent Swarm Orchestration</h2>
                  <p>Sequence details for coordinating wellness, calendar recovery and day priorities.</p>
                </div>

                <div className="agents-cards-grid mt-6">
                  {agentsData.map((agent, index) => {
                    const isVisible = index < visibleCount
                    const isActive = index === activeAgentIndex && swarmPhase === 'running'
                    const isComplete = completedAgents.has(agent.id)

                    return (
                      <SwarmAgentCard
                        key={agent.id}
                        agent={agent}
                        index={index}
                        isVisible={isVisible}
                        isActive={isActive}
                        isComplete={isComplete}
                        onSelect={setSelectedAgentId}
                        isSelected={selectedAgentId === agent.id}
                      />
                    )
                  })}
                </div>
              </div>

              <AnimatePresence>
                {swarmPhase === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <DayPlanOutput
                      speechActive={speechActive}
                      onPlay={() => triggerVoiceSpeech(voiceNarrationData)}
                      onStop={stopVoiceSpeech}
                      tasks={tasksData}
                      voiceNarration={voiceNarrationData}
                    />
                    <div ref={bottomRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Trace Overlay Panel */}
      <AnimatePresence>
        {activeAgent && (
          <AgentTracePanel
            agent={activeAgent}
            onClose={() => setSelectedAgentId(null)}
          />
        )}
      </AnimatePresence>

      <footer className="footer-text">
        © 2026 Sarvam Swarm Lite · Autonomous Personalized Life Co-Pilot
      </footer>
    </div>
  )
}
