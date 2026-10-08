import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Mic, Send, Sparkles, Brain, Volume2, Play, Square, Info, Plus, Menu, Zap, Rocket, Lightbulb, LayoutGrid, Heart, Flame, Crown, ChevronDown, Check, X, ArrowUp } from 'lucide-react'
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

const DYNAMIC_PLACEHOLDERS = [
  "Type / or ask anything...",
  "Plan my day & schedule...",
  "Suggest a healthy lunch near me...",
  "How can I optimize my energy today?...",
  "Schedule a 30-min relaxation break...",
  "Tell me about my tasks & priorities..."
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
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % DYNAMIC_PLACEHOLDERS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])
  
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
              className="homepage-container flex flex-col justify-between items-center h-[100dvh] lg:h-full lg:max-h-none lg:justify-center py-3 lg:py-10 px-4 lg:px-8 overflow-hidden lg:overflow-y-auto relative"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Top Navigation Bar — Mobile / Tablet Only (Hidden on Desktop) */}
              <div className="w-full flex items-center justify-between px-2 pt-1 max-w-2xl flex-none z-10 lg:hidden">
                <button
                  type="button"
                  className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-white hover:bg-[#27272a] transition-colors cursor-pointer"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu size={20} />
                </button>

                <div 
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={handleBackToHome}
                  title="Return to Swarm Home"
                >
                  <div className="w-9 h-9 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-white">
                    <SwarmLogo size={20} />
                  </div>
                  <span className="font-semibold text-sm text-white font-sans hidden sm:inline">SwarmAssist</span>
                </div>
              </div>

              {/* Center Hero Section */}
              <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center my-auto lg:my-0 py-2 lg:py-0">
                
                {/* Mobile Hero Title */}
                <div className="text-center space-y-1.5 mt-2 mb-1 lg:hidden">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                    What should we explore?
                  </h1>
                  <p className="text-xs sm:text-sm text-[#8e8f9a]">
                    Autonomous Personalized Life Co-Pilot
                  </p>
                </div>

                {/* Desktop Hero Title with Big Swarm Logo */}
                <div className="hidden lg:flex flex-col items-center text-center mb-6">
                  <div 
                    className="flex items-center justify-center gap-4 mb-2 cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={handleBackToHome}
                    title="Reset to Swarm Home"
                  >
                    <SwarmLogo size={52} className="text-white" />
                    <h1 className="text-4xl font-extrabold tracking-tight text-white font-sans">Sarvam Swarm</h1>
                  </div>
                  <p className="text-sm font-medium text-[#8e8f9a] tracking-wide">— Autonomous Personalized Life Co-Pilot</p>
                </div>

                {/* Quick Suggestions Pills */}
                <div className="w-full max-w-2xl mx-auto pt-2 sm:pt-4 pb-1">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="px-3.5 py-1.5 rounded-full bg-[#18181b] border border-[#27272a] text-xs font-medium text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] hover:bg-[#27272a] transition-all whitespace-nowrap cursor-pointer"
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
              </div>

              {/* Bottom Container: SuperSwarm Banner + Input Card */}
              <motion.div 
                className="w-full max-w-2xl flex flex-col gap-2.5 mt-auto lg:mt-6 pb-2 flex-none z-10"
                initial={{ y: 0, opacity: 1 }}
                exit={{ y: 350, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 1, 0.35, 1] }}
              >
                {/* Grok-Style Floating Upgrade Banner (Mobile & Tablet ONLY — Hidden on Laptop for clean desktop view) */}
                <div className="w-full bg-gradient-to-r from-[#121318] via-[#1a1c24] to-[#121318] border border-[#2a2c36] rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-lg relative overflow-hidden group lg:hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
                  <div className="space-y-0.5 z-10">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>SuperSwarm</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">PRO</span>
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#9496a1]">Unlock extended multi-agent capabilities</p>
                  </div>
                  <button 
                    onClick={() => navigate('/upgrade')}
                    className="z-10 bg-white text-black font-semibold text-xs px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
                  >
                    Upgrade
                  </button>
                </div>

                {/* Grok-Style Input Card */}
                <div className="grok-input-card relative w-full bg-[#18181b] border border-[#27272a] rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-4 shadow-2xl flex flex-col gap-3 transition-all focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent-ring)]">
                  
                  {/* Top: Text Area / Field + Left-to-Right Animated Placeholder */}
                  <div className="relative w-full flex items-center min-h-[28px]">
                    <input
                      type="text"
                      className="w-full bg-transparent border-none outline-none text-white text-base sm:text-lg px-1 font-sans focus:outline-none focus:ring-0 z-10"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleStartSwarm()}
                      disabled={isListening}
                    />

                    {/* Smooth Left-to-Right Sliding Animated Placeholder */}
                    {!input && (
                      <div className="absolute left-1 right-28 pointer-events-none overflow-hidden h-full flex items-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={placeholderIndex}
                            initial={{ opacity: 0, x: -28 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 28 }}
                            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            className="text-[#6e6f7a] text-base sm:text-lg font-sans select-none whitespace-nowrap truncate"
                          >
                            {DYNAMIC_PLACEHOLDERS[placeholderIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {/* Hidden File Upload */}
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

                  {/* Bottom Toolbar Row */}
                  <div className="flex items-center justify-between pt-1">
                    {/* Left: Plus Attachment Button */}
                    <button
                      type="button"
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[#8e8f9a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
                      onClick={() => {
                        const el = document.getElementById('file-upload')
                        if (el) el.click()
                      }}
                      title="Attach file"
                    >
                      <Plus size={20} />
                    </button>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                      {/* Mode Selector Dropdown */}
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#27272a] hover:bg-[#3f3f46] transition-all text-xs font-semibold text-white whitespace-nowrap cursor-pointer border border-[#3f3f46]"
                        >
                          {swarmMode === 'Lightning' && <Zap size={14} className="text-[#a1a1aa]" />}
                          {swarmMode === 'Deep Swarm' && <Rocket size={14} className="text-[#a1a1aa]" />}
                          {swarmMode === 'Wellness Mode' && <Lightbulb size={14} className="text-[#a1a1aa]" />}
                          {swarmMode === 'Hustle Mode' && <LayoutGrid size={14} className="text-[#a1a1aa]" />}
                          <span className="whitespace-nowrap">{swarmMode}</span>
                          <ChevronDown size={13} className="opacity-60 ml-0.5" />
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute bottom-full right-0 mb-3 w-[260px] bg-[#18181b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden z-50 text-left p-1.5">
                            <div className="flex flex-col gap-0.5">
                              {/* Fast / Lightning */}
                              <button 
                                onClick={() => { setSwarmMode('Lightning'); setIsDropdownOpen(false) }} 
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#27272a] transition-colors w-full text-left cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <Zap size={18} className="text-[#a1a1aa] group-hover:text-white transition-colors" />
                                  <span className="font-medium text-white text-sm">Fast</span>
                                </div>
                                {swarmMode === 'Lightning' && <Check size={16} className="text-white" />}
                              </button>

                              {/* Auto / Deep Swarm */}
                              <button 
                                onClick={() => { setSwarmMode('Deep Swarm'); setIsDropdownOpen(false) }} 
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#27272a] transition-colors w-full text-left cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <Rocket size={18} className="text-[#a1a1aa] group-hover:text-white transition-colors" />
                                  <span className="font-medium text-white text-sm">Auto</span>
                                </div>
                                {swarmMode === 'Deep Swarm' && <Check size={16} className="text-white" />}
                              </button>

                              {/* Expert / Wellness Mode */}
                              <button 
                                onClick={() => { setSwarmMode('Wellness Mode'); setIsDropdownOpen(false) }} 
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#27272a] transition-colors w-full text-left cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <Lightbulb size={18} className="text-[#a1a1aa] group-hover:text-white transition-colors" />
                                  <span className="font-medium text-white text-sm">Expert</span>
                                </div>
                                {swarmMode === 'Wellness Mode' && <Check size={16} className="text-white" />}
                              </button>

                              {/* Heavy / Hustle Mode */}
                              <button 
                                onClick={() => { setSwarmMode('Hustle Mode'); setIsDropdownOpen(false) }} 
                                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#27272a] transition-colors w-full text-left cursor-pointer group"
                              >
                                <div className="flex items-center gap-3">
                                  <LayoutGrid size={18} className="text-[#a1a1aa] group-hover:text-white transition-colors" />
                                  <span className="font-medium text-white text-sm">Heavy</span>
                                </div>
                                {swarmMode === 'Hustle Mode' && <Check size={16} className="text-white" />}
                              </button>
                            </div>

                            {/* Grok Upgrade Promo Card in Dropdown */}
                            <div className="mt-1.5 pt-1.5 border-t border-[#27272a]">
                              <button onClick={() => { setIsDropdownOpen(false); navigate('/upgrade') }} className="flex items-center justify-between p-3 rounded-xl bg-[#202124] hover:bg-[#27272a] transition-colors w-full text-left cursor-pointer">
                                <div>
                                  <span className="font-bold text-white text-sm block">SuperSwarm</span>
                                  <span className="text-[11px] text-[#9496a1]">Unlock extended capabilities</span>
                                </div>
                                <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">Sign in</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mic Voice Button */}
                      <button
                        type="button"
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[#8e8f9a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer ${isListening ? 'text-[var(--accent)] animate-pulse' : ''}`}
                        onClick={toggleListening}
                        title={isListening ? 'Listening...' : 'Voice Input'}
                      >
                        <Mic size={18} />
                      </button>

                      {/* Grok-style Voice Wave / Action Button */}
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-full bg-[#1d4ed8] hover:bg-[#2563eb] text-white flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer shadow-md text-xs font-bold"
                        onClick={() => handleStartSwarm()}
                        title="Send Request"
                      >
                        <div className="flex items-center gap-0.5 h-3">
                          <span className="w-0.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-3.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grok-style disclaimer note */}
                <p className="text-center text-[11px] text-[#71717a] mt-0.5">
                  By messaging SwarmAssist, you agree to our <span className="underline cursor-pointer hover:text-white">Terms</span> and <span className="underline cursor-pointer hover:text-white">Privacy Policy</span>.
                </p>
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
              <div className="logo-group cursor-pointer hover:opacity-80 transition-opacity" onClick={handleBackToHome} title="Return to Swarm Home">
                <button
                  type="button"
                  className="mobile-menu-trigger mr-1 lg:hidden"
                  onClick={(e) => { e.stopPropagation(); setSidebarOpen(true) }}
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
