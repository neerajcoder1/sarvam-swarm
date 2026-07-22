import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Send, Sparkles, Brain, Volume2, Play, Square, Info, Plus, Menu } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import SwarmLogo from '../components/SwarmLogo'
import SwarmAgentCard from '../components/SwarmAgentCard'
import AgentTracePanel from '../components/AgentTracePanel'
import DayPlanOutput from '../components/DayPlanOutput'
import { SWARM_AGENTS, DAY_PLAN_TASKS, VOICE_NARRATION } from '../data/agents'
import { speakText, cancelSpeech, createSpeechRecognition } from '../agents/speech'
import { runSwarmOrchestration } from '../agents/orchestrator'
const QUICK_SUGGESTIONS = [
  "Plan my day",
  "What's my schedule today?",
  "Suggest a healthy lunch near me",
  "Add 30 min break",
  "Tell me about my tasks"
]

export default function Dashboard() {
  const [view, setView] = useState('homepage') // 'homepage' | 'dashboard'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [swarmPhase, setSwarmPhase] = useState('idle') // 'idle' | 'running' | 'complete'
  const [visibleCount, setVisibleCount] = useState(0)
  const [activeAgentIndex, setActiveAgentIndex] = useState(-1)
  const [completedAgents, setCompletedAgents] = useState(new Set())
  const [selectedAgentId, setSelectedAgentId] = useState(null)
  const [speechActive, setSpeechActive] = useState(false)
  const [agentsData, setAgentsData] = useState(SWARM_AGENTS)
  const [voiceNarrationData, setVoiceNarrationData] = useState(VOICE_NARRATION)
  const [voiceSettings, setVoiceSettings] = useState(null)
  const [tasksList, setTasksList] = useState([])
  const [predictionAdded, setPredictionAdded] = useState(false)
  const [predictiveMode, setPredictiveMode] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(() => {
    return localStorage.getItem('sarwam_profile_loaded') === 'true'
  })

  const recognitionRef = useRef(null)
  const bottomRef = useRef(null)
  const timersRef = useRef([])
  const toastTimerRef = useRef(null)

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Pre-load voices for Chrome/Edge
      window.speechSynthesis.getVoices()
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices()
      }
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)

      return () => {
        clearTimers()
        window.speechSynthesis.cancel()
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
      }
    } else {
      return () => clearTimers()
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
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
      return
    }

    const recognition = createSpeechRecognition(
      (transcript) => {
        setInput(transcript)
        handleStartSwarm(transcript)
      },
      (err) => {
        console.error('Speech recognition error:', err)
        setIsListening(false)
      },
      () => {
        setIsListening(false)
      }
    )

    if (!recognition) {
      // Fallback simulated voice typing
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
          setTimeout(() => {
            handleStartSwarm(simulatedText)
          }, 600)
        }
      }, 40)

      return
    }

    try {
      recognition.onstart = () => setIsListening(true)
      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setIsListening(false)
    }
  }

  const triggerToast = (msg) => {
    setToastMessage(msg)
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  const addBreakfastTask = () => {
    setTasksList(prev => {
      if (prev.some(t => t.time === '8:15 AM')) return prev
      const breakfastTask = {
        time: '8:15 AM',
        title: 'Healthy breakfast routine',
        description: 'Balanced breakfast — auto-added by proactive prediction.',
        status: 'done'
      }
      const updated = [...prev]
      updated.splice(1, 0, breakfastTask)
      return updated
    })

    setPredictionAdded(true)
    triggerToast("✅ Added to your day")
  }

  const handleLoadProfile = () => {
    localStorage.setItem('sarwam_profile_loaded', 'true')
    setProfileLoaded(true)
    triggerToast("👤 Profile Memory Loaded")

    setTasksList(prev => {
      let updated = [...prev]

      if (!updated.some(t => t.time === '8:30 AM')) {
        const morningWalk = {
          time: '8:30 AM',
          title: '15-min morning walk',
          description: 'Quick walk with mom — suggested from profile memory.',
          status: 'done'
        }
        const insertIdx = updated.findIndex(t => t.time === '10:30 AM' || t.time === '2:30 PM')
        updated.splice(insertIdx !== -1 ? insertIdx : 1, 0, morningWalk)
      }

      if (!updated.some(t => t.time === '2:15 PM')) {
        const proteinSnack = {
          time: '2:15 PM',
          title: 'Protein snack & recharge',
          description: 'Light snack to avoid energy dip — suggested from profile memory.',
          status: 'done'
        }
        const insertIdx = updated.findIndex(t => t.time === '2:30 PM' || t.time === '3:00 PM')
        updated.splice(insertIdx !== -1 ? insertIdx : updated.length - 1, 0, proteinSnack)
      }

      return updated
    })
  }

  const togglePredictiveMode = () => {
    const nextMode = !predictiveMode
    setPredictiveMode(nextMode)
    triggerToast(nextMode ? "⚡ Predictive Mode: ON" : "💤 Predictive Mode: OFF")

    if (nextMode && !predictionAdded) {
      setTimeout(() => {
        addBreakfastTask()
      }, 600)
    }
  }

  // Trigger Swarm flow with FastAPI integration
  const handleStartSwarm = async (queryText = input) => {
    if (!queryText.trim()) return

    // Auto collapse sidebar as soon as task is performed
    setSidebarCollapsed(true)
    setSidebarOpen(false)

    // First transition to loading view
    setView('loading')
    setSwarmPhase('idle')
    clearTimers()

    // Reset prediction & tasks
    setPredictionAdded(false)
    setToastMessage(null)

    // Setup transition from loading to active dashboard
    const startTimer = setTimeout(async () => {
      setView('dashboard')
      setSwarmPhase('running')
      setVisibleCount(0)
      setActiveAgentIndex(-1)
      setCompletedAgents(new Set())
      setSelectedAgentId(null)

      // Run the isolated agent swarm orchestration
      const swarmTimers = await runSwarmOrchestration(queryText, {
        onDataLoaded: (activeData) => {
          setAgentsData(activeData.agents)
          setVoiceNarrationData(activeData.voice_narration)
          setVoiceSettings(activeData.voice_settings)

          let finalTasks = [...activeData.tasks]
          if (profileLoaded) {
            if (!finalTasks.some(t => t.time === '8:30 AM')) {
              finalTasks.splice(1, 0, {
                time: '8:30 AM',
                title: '15-min morning walk',
                description: 'Quick walk with mom — suggested from profile memory.',
                status: 'done'
              })
            }
            if (!finalTasks.some(t => t.time === '2:15 PM')) {
              const insertIdx = finalTasks.findIndex(t => t.time === '2:30 PM' || t.time === '3:00 PM')
              finalTasks.splice(insertIdx !== -1 ? insertIdx : finalTasks.length - 1, 0, {
                time: '2:15 PM',
                title: 'Protein snack & recharge',
                description: 'Light snack to avoid energy dip — suggested from profile memory.',
                status: 'done'
              })
            }
          }
          setTasksList(finalTasks)
        },
        onAgentAppear: (index) => {
          setVisibleCount(index + 1)
          setActiveAgentIndex(index)
        },
        onAgentComplete: (agentId, isLastAgent) => {
          setCompletedAgents((prev) => {
            const next = new Set(prev)
            next.add(agentId)
            return next
          })
          if (!isLastAgent) {
            setActiveAgentIndex(prev => prev + 1)
          }
        },
        onSwarmComplete: (voiceNarration, voiceSettingsObj) => {
          setActiveAgentIndex(-1)
          setSwarmPhase('complete')
          triggerVoiceSpeech(voiceNarration, voiceSettingsObj)
        }
      })

      // Add all orchestration timers to global tracking
      timersRef.current.push(...swarmTimers)
    }, 1500) // Transition loading -> dashboard in 1.5 seconds

    timersRef.current.push(startTimer)
  }

  const triggerVoiceSpeech = (textToSpeak = voiceNarrationData, settings = voiceSettings) => {
    speakText(
      textToSpeak,
      settings,
      () => setSpeechActive(true),
      () => setSpeechActive(false),
      (err) => {
        console.error(err)
        setSpeechActive(false)
      }
    )
  }

  const stopVoiceSpeech = () => {
    cancelSpeech()
    setSpeechActive(false)
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
    setPredictionAdded(false)
    setToastMessage(null)
  }

  const activeAgent = agentsData.find((a) => a.id === selectedAgentId)

  return (
    <div className="app-shell-flex">
      {/* Permanent Left Sidebar (24% width with slide collapse) */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onSelectAction={(promptText) => {
          setSidebarCollapsed(true)
          setSidebarOpen(false)
          if (promptText) {
            setInput(promptText)
            handleStartSwarm(promptText)
          }
        }}
        onNewConversation={() => {
          handleBackToHome()
          setSidebarOpen(false)
        }}
      />

      <div className="main-content-flex">
        {/* Background Subtle Grid Overlay */}
        <div className="grid-overlay" aria-hidden="true" />

        <AnimatePresence mode="wait">
          {view === 'homepage' ? (
            <motion.div
              key="homepage-view"
              className="homepage-container"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute top-4 left-4 lg:hidden">
                <button
                  type="button"
                  className="mobile-menu-trigger"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu size={18} />
                </button>
              </div>

            <motion.div
              className="input-container-centered"
              initial={{ y: 0, opacity: 1 }}
              exit={{ y: 350, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 1, 0.35, 1] }}
            >
              {/* Large Centered Title with Swarm Logo */}
              <div className="homepage-hero-group">
                <div className="homepage-hero-title-row">
                  <SwarmLogo size={56} className="homepage-hero-logo" />
                  <h1 className="homepage-hero-title">Sarvam Swarm</h1>
                </div>
                <p className="homepage-hero-subtitle">— Autonomous Personalized Life Co-Pilot</p>
              </div>

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
                <div className="input-prefix-icon">
                  <Plus size={20} />
                </div>
                <input
                  type="text"
                  className="main-input-field"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="What do you want to know?"
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
                  <Mic size={20} />
                </button>

                {input.trim() && (
                  <button
                    type="button"
                    className="send-button"
                    onClick={() => handleStartSwarm()}
                    title="Send Request"
                  >
                    <Send size={16} />
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
                <button
                  type="button"
                  className="mobile-menu-trigger mr-1 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu size={18} />
                </button>
                <div className="logo-icon flex items-center justify-center">
                  <SwarmLogo size={22} className="text-[var(--text)]" />
                </div>
                <span className="logo-text">Sarvam Swarm</span>
              </div>

              <div className="header-actions">
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="px-4 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent)] text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-all cursor-pointer"
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
                    className="dashboard-results-grid mt-8 text-left"
                  >
                    {/* Left Column: Day Plan Output */}
                    <div className="dashboard-results-left">
                      <DayPlanOutput
                        tasks={tasksList}
                        speechActive={speechActive}
                        onPlay={() => triggerVoiceSpeech(voiceNarrationData, voiceSettings)}
                        onStop={stopVoiceSpeech}
                        voiceNarration={voiceNarrationData}
                      />
                    </div>

                    {/* Right Column: Prediction + Memory Cards */}
                    <div className="dashboard-results-right flex flex-col gap-6">
                      {/* Swarm Prediction Card */}
                      <div className="prediction-card glass-panel">
                        <div className="prediction-card-header">
                          <div className="prediction-card-title-group">
                            <span className="prediction-card-icon">🕒</span>
                            <div className="flex flex-col text-left">
                              <h3 className="prediction-card-title">Swarm Prediction</h3>
                              <p className="prediction-card-subtitle">Proactive AI Co-Pilot</p>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div className="flex items-center gap-3">
                            <span className="prediction-toggle-label text-xs font-semibold text-[var(--text-subtle)]">
                              Predictive Mode: {predictiveMode ? 'ON' : 'OFF'}
                            </span>
                            <button
                              type="button"
                              className={`prediction-toggle-switch ${predictiveMode ? 'active' : ''}`}
                              onClick={togglePredictiveMode}
                              aria-label="Toggle Predictive Mode"
                            >
                              <div className="prediction-toggle-knob" />
                            </button>
                          </div>
                        </div>

                        <div className="prediction-card-body mt-2 text-left">
                          <p className="prediction-card-desc">
                            It’s 8:10 AM — you usually eat breakfast at 8:15. Want me to add it automatically?
                          </p>

                          <div className="prediction-card-actions mt-4 text-left">
                            {predictionAdded ? (
                              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-xs font-bold">✓</span>
                                <span>Added to your day</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className="prediction-add-btn"
                                onClick={addBreakfastTask}
                              >
                                Yes, add it now
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* My Profile Memory Card */}
                      <div className="prediction-card glass-panel text-left">
                        <div className="prediction-card-header">
                          <div className="prediction-card-title-group">
                            <span className="prediction-card-icon">👤</span>
                            <div className="flex flex-col">
                              <h3 className="prediction-card-title">My Profile Memory</h3>
                              <p className="prediction-card-subtitle text-left">Swarm Memory Node</p>
                            </div>
                          </div>
                        </div>

                        <div className="prediction-card-body mt-2 text-left">
                          <p className="prediction-card-desc text-[var(--text-muted)] font-medium">
                            Swarm remembers: Priya prefers morning walks with mom. Gets low on energy between 2–4 PM. Always calls mom at 8:30 PM. Last task: Grocery list prepared.
                          </p>

                          <AnimatePresence>
                            {profileLoaded ? (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-3 border-t border-[var(--line)] flex flex-col gap-2 overflow-hidden"
                              >
                                <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                                  Smart suggestions loaded:
                                </span>
                                <div className="flex flex-col gap-2 text-xs text-[var(--text-muted)]">
                                  <div className="flex items-start gap-2 bg-[var(--surface-hover)] p-2.5 rounded-lg border border-[var(--line)]">
                                    <span className="text-[var(--accent)] font-bold">💡</span>
                                    <span>Since you usually walk in the morning, I added 15-min walk (8:30 AM).</span>
                                  </div>
                                  <div className="flex items-start gap-2 bg-[var(--surface-hover)] p-2.5 rounded-lg border border-[var(--line)]">
                                    <span className="text-[var(--accent)] font-bold">💡</span>
                                    <span>Your energy is low at 2 PM — should I suggest a protein snack? (Added at 2:15 PM).</span>
                                  </div>
                                </div>
                              </motion.div>
                            ) : (
                              <button
                                type="button"
                                className="prediction-add-btn mt-4"
                                onClick={handleLoadProfile}
                              >
                                Load My Profile
                              </button>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

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
            key="trace-panel"
            agent={activeAgent}
            onClose={() => setSelectedAgentId(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            className="toast-notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: "-50%" }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer-text flex flex-col gap-1 items-center justify-center">
        <span>© 2026 Sarvam Swarm Lite · Autonomous Personalized Life Co-Pilot</span>
      </footer>
      </div>
    </div>
  )
}
