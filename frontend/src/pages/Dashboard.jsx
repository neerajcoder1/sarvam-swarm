import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Send, Sparkles, Brain, Volume2, Play, Square, Info, Plus, Menu, Zap, Heart, Flame, Crown, ChevronDown, Check, X } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ThemeToggle from '../components/ThemeToggle'
import SwarmLogo from '../components/SwarmLogo'
import SwarmAgentCard from '../components/SwarmAgentCard'
import AgentTracePanel from '../components/AgentTracePanel'
import DayPlanOutput from '../components/DayPlanOutput'
import SwarmCapabilities from '../components/SwarmCapabilities'
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
  const navigate = useNavigate()
  const [view, setView] = useState(() => {
    const hasSeen = sessionStorage.getItem('swarm_has_seen_splash')
    return hasSeen ? 'homepage' : 'splash'
  })
  const [swarmMode, setSwarmMode] = useState('Deep Swarm')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // 'splash' | 'homepage' | 'loading' | 'dashboard'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('swarm_chat_history')
    return saved ? JSON.parse(saved) : []
  })
  const [activeChatId, setActiveChatId] = useState(null)

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
  const [audioData, setAudioData] = useState(null)
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

  // Splash Screen Timer
  useEffect(() => {
    if (view === 'splash') {
      const splashTimer = setTimeout(() => {
        sessionStorage.setItem('swarm_has_seen_splash', 'true')
        setView('homepage')
      }, 3000) // Show splash for 3 seconds
      return () => clearTimeout(splashTimer)
    }
  }, [view])

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
          setAudioData(activeData.audio_base64 || null)

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
                onSwarmComplete: (voiceNarration, voiceSettingsObj, audioBase64) => {
          setActiveAgentIndex(-1)
          setSwarmPhase('complete')
          
          setTasksList(prevTasks => {
            const newChat = {
               id: Date.now().toString(),
               title: queryText,
               time: 'Just now',
               tasks: prevTasks
            };
            setChatHistory(prevHistory => {
               const updated = [newChat, ...prevHistory];
               localStorage.setItem('swarm_chat_history', JSON.stringify(updated));
               return updated;
            });
            setActiveChatId(newChat.id);
            return prevTasks;
          });

          triggerVoiceSpeech(voiceNarration, voiceSettingsObj, audioBase64)
        }
      })

      // Add all orchestration timers to global tracking
      timersRef.current.push(...swarmTimers)
    }, 1500) // Transition loading -> dashboard in 1.5 seconds

    timersRef.current.push(startTimer)
  }

  const triggerVoiceSpeech = (textToSpeak = voiceNarrationData, settings = voiceSettings, audio = audioData) => {
    speakText(
      textToSpeak,
      settings,
      () => setSpeechActive(true),
      () => setSpeechActive(false),
      (err) => {
        console.error(err)
        setSpeechActive(false)
      },
      audio
    )
  }

  const stopVoiceSpeech = () => {
    cancelSpeech()
    setSpeechActive(false)
  }

  
  const handleSelectHistory = (id) => {
    const chat = chatHistory.find(c => c.id === id)
    if (chat) {
      setActiveChatId(id)
      setTasksList(chat.tasks)
      setSwarmPhase('complete')
      setView('dashboard')
      setSidebarOpen(false)
      if (window.innerWidth < 768) setSidebarCollapsed(true)
      
      setVisibleCount(agentsData.length)
      setCompletedAgents(new Set(agentsData.map(a => a.id)))
    }
  }

    useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calendar_connected') === 'true') {
      triggerToast("✅ Google Calendar connected securely!");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

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
      {view !== 'splash' && (
        <Sidebar
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen((prev) => !prev)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          chatHistory={chatHistory}
          activeChatId={activeChatId}
          onSelectHistory={handleSelectHistory}
          onSelectAction={(promptText) => {
            setSidebarCollapsed(true)
            setSidebarOpen(false)
            if (promptText) {
              setInput(promptText)
              handleStartSwarm(promptText)
            }
          }}
          onToast={triggerToast}
            onNewConversation={() => {
            handleBackToHome()
            setSidebarOpen(false)
            triggerToast("Started a new conversation ✨")
          }}
        />
      )}

      <div className="main-content-flex">
        {/* Background Subtle Grid Overlay */}
        <div className="grid-overlay" aria-hidden="true" />

        <AnimatePresence mode="wait">
          {view === 'splash' ? (
            <motion.div
              key="splash-view"
              className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--background)] z-50 p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center gap-4 text-center max-w-4xl w-full">
                <SwarmCapabilities />
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="mt-2 text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[var(--text)] to-[var(--text-muted)]"
                >
                  Initializing Sarvam Swarm Network...
                </motion.h2>
              </div>
            </motion.div>
          ) : view === 'homepage' ? (
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

              <div className="main-input-bar relative">
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

                
                {/* Mode Selector Dropdown — visible on all screen sizes */}
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl hover:bg-[#2c2d33] cursor-pointer transition-all text-[var(--text-muted)] hover:text-white text-sm font-medium"
                  >
                    {swarmMode === 'Lightning' && <Zap size={14} className="text-yellow-500" />}
                    {swarmMode === 'Deep Swarm' && <Brain size={14} className="text-blue-400" />}
                    {swarmMode === 'Wellness Mode' && <Heart size={14} className="text-pink-400" />}
                    {swarmMode === 'Hustle Mode' && <Flame size={14} className="text-orange-400" />}
                    {/* Show label on all screen sizes */}
                    <span>{swarmMode}</span>
                    <ChevronDown size={14} className="opacity-50 ml-0.5" />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute bottom-full right-0 mb-3 w-[240px] bg-[#1a1b1e] border border-[#2c2d33] rounded-2xl shadow-2xl overflow-hidden z-50 text-left">
                      <div className="p-2 flex justify-between items-center">
                        <span className="text-xs font-semibold text-[var(--text-muted)] pl-2 uppercase tracking-wider">Swarm Mode</span>
                        <button 
                          onClick={() => setIsDropdownOpen(false)} 
                          className="p-1 hover:bg-[#2c2d33] rounded-md transition-colors text-[var(--text-muted)] hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="p-2 flex flex-col gap-1 pt-0">
                        <button onClick={() => { setSwarmMode('Lightning'); setIsDropdownOpen(false) }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2c2d33] transition-colors w-full text-left relative">
                          <Zap size={18} className="text-yellow-500" />
                          <div>
                            <span className="font-semibold text-white block">Lightning</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Fast, instant answers</span>
                          </div>
                          {swarmMode === 'Lightning' && <Check size={16} className="absolute right-4 text-white" />}
                        </button>
                        <button onClick={() => { setSwarmMode('Deep Swarm'); setIsDropdownOpen(false) }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2c2d33] transition-colors w-full text-left relative">
                          <Brain size={18} className="text-blue-400" />
                          <div>
                            <span className="font-semibold text-white block">Deep Swarm</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Full 5-agent pipeline</span>
                          </div>
                          {swarmMode === 'Deep Swarm' && <Check size={16} className="absolute right-4 text-white" />}
                        </button>
                        <button onClick={() => { setSwarmMode('Wellness Mode'); setIsDropdownOpen(false) }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2c2d33] transition-colors w-full text-left relative">
                          <Heart size={18} className="text-pink-400" />
                          <div>
                            <span className="font-semibold text-white block">Wellness Mode</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Biometric-aware planning</span>
                          </div>
                          {swarmMode === 'Wellness Mode' && <Check size={16} className="absolute right-4 text-white" />}
                        </button>
                        <button onClick={() => { setSwarmMode('Hustle Mode'); setIsDropdownOpen(false) }} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#2c2d33] transition-colors w-full text-left relative">
                          <Flame size={18} className="text-orange-400" />
                          <div>
                            <span className="font-semibold text-white block">Hustle Mode</span>
                            <span className="text-[11px] text-[var(--text-muted)]">Max productivity, no breaks</span>
                          </div>
                          {swarmMode === 'Hustle Mode' && <Check size={16} className="absolute right-4 text-white" />}
                        </button>
                      </div>
                      <div className="p-2 border-t border-[#2c2d33] bg-[#222327]">
                        <button onClick={() => navigate('/upgrade')} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#2c2d33] transition-colors w-full text-left group">
                          <div>
                            <div className="flex items-center gap-2">
                              <Crown size={14} className="text-yellow-400" />
                              <span className="font-bold text-white group-hover:text-purple-400 transition-colors">Sarvam Ultra</span>
                            </div>
                            <span className="text-xs text-[var(--text-muted)]">Unlock extended capabilities</span>
                          </div>
                          <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">Upgrade</span>
                        </button>
                      </div>
                    </div>
                  )}
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
                  title="Send Request"
                >
                  <Send size={16} strokeWidth={2.5} />
                </button>
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

                <div className="agents-cards-grid mt-6 relative min-h-[300px]">
                  {visibleCount === 0 && (
                    <motion.div 
                      className="absolute inset-0 flex flex-col items-center justify-center pt-10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="premium-loader-rings mb-6 scale-75">
                        <div className="loader-ring loader-ring-outer" />
                        <div className="loader-ring loader-ring-inner" />
                        <Brain className="loader-icon-center text-indigo-400" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text)] mb-2 animate-pulse">Waking up the Swarm...</h3>
                      <p className="text-sm text-[var(--text-muted)] max-w-md text-center px-4">
                        Synthesizing your prompt, analyzing memory, and generating premium voice audio. This may take 20-30 seconds.
                      </p>
                    </motion.div>
                  )}
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
                        onPlay={() => triggerVoiceSpeech(voiceNarrationData, voiceSettings, audioData)}
                        onStop={stopVoiceSpeech}
                        voiceNarration={voiceNarrationData}
                      />
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

            {view !== 'splash' && (
        <footer className="flex flex-col gap-1 items-center justify-center py-4 w-full z-10">
          <span className="text-[11px] text-[var(--text-muted)] tracking-wide font-medium">© 2026 Sarvam Swarm Lite · Autonomous Personalized Life Co-Pilot</span>
        </footer>
      )}
      </div>
    </div>
  )
}
