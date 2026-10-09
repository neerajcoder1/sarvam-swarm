import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sliders, Volume2, Shield, Sparkles, Check, Trash2, Cpu, Play } from 'lucide-react'
import { speakText, cancelSpeech } from '../agents/speech'

export default function SettingsModal({ isOpen, onClose, onToast }) {
  const [activeTab, setActiveTab] = useState('general')
  const [isPlayingTestVoice, setIsPlayingTestVoice] = useState(false)
  const [availableVoices, setAvailableVoices] = useState([])

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('swarm_settings')
    return saved ? JSON.parse(saved) : {
      language: 'hinglish',
      voiceGender: 'female',
      systemVoice: '',
      autoPlayVoice: true,
      timeFormat: '12h',
      energyPacing: 'balanced',
      aiModel: 'gemini-2.5-flash',
      showAgentTraces: true,
      soundEffects: true
    }
  })

  useEffect(() => {
    localStorage.setItem('swarm_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const vList = window.speechSynthesis.getVoices()
        setAvailableVoices(vList)
      }
      loadVoices()
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices
      }
    }
  }, [])

  const handleTestVoice = () => {
    cancelSpeech()
    setIsPlayingTestVoice(true)
    const sampleText = settings.language === 'hindi'
      ? "नमस्ते! यह स्वरम असिस्ट एआई वॉइस टेस्ट है।"
      : "Hello! This is your SwarmAssist AI co-pilot voice test."

    speakText(
      sampleText,
      {
        gender: settings.voiceGender || 'female',
        voiceName: settings.systemVoice || '',
        locale: settings.language === 'hindi' ? 'hi-IN' : 'en-IN'
      },
      () => setIsPlayingTestVoice(true),
      () => setIsPlayingTestVoice(false),
      () => setIsPlayingTestVoice(false)
    )
  }

  if (!isOpen) return null

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    if (onToast) onToast(`Updated ${key} setting`)
  }

  const handleClearCache = () => {
    localStorage.removeItem('swarm_chat_history')
    if (onToast) onToast("All application cache cleared")
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="relative w-full max-w-2xl bg-[#09090b] border border-[#222329] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white"
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#222329] bg-[#09090b] z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <Sliders size={18} className="text-white/80" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">Settings</h2>
                <p className="text-[11px] text-white/40">Manage your SwarmAssist platform preferences</p>
              </div>
            </div>
            <button 
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 pb-0 border-b border-[#222329] bg-[#0c0d10] overflow-x-auto no-scrollbar">
            {[
              { id: 'general', label: 'General', icon: Sliders },
              { id: 'voice', label: 'Voice & Audio', icon: Volume2 },
              { id: 'ai', label: 'Swarm AI', icon: Cpu },
              { id: 'data', label: 'Data & Storage', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-white text-white bg-white/5 rounded-t-xl'
                      : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/[0.02] rounded-t-xl'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-[#141518] rounded-2xl border border-[#222329]">
                  <div>
                    <p className="font-medium text-white text-sm">Time Format</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Choose how time blocks are rendered across daily plans</p>
                  </div>
                  <div className="flex items-center bg-[#09090b] p-1 rounded-xl border border-[#222329]">
                    <button
                      onClick={() => updateSetting('timeFormat', '12h')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        settings.timeFormat === '12h' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      12-Hour
                    </button>
                    <button
                      onClick={() => updateSetting('timeFormat', '24h')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        settings.timeFormat === '24h' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      24-Hour
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#141518] rounded-2xl border border-[#222329]">
                  <div>
                    <p className="font-medium text-white text-sm">Sound Effects</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Audible chimes when tasks complete or swarm agent transitions</p>
                  </div>
                  <button
                    onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      settings.soundEffects ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        settings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'voice' && (
              <div className="space-y-5">
                {/* Voice Performer Gender Selection */}
                <div className="p-4 bg-[#141518] rounded-2xl border border-[#222329] space-y-3">
                  <div>
                    <p className="font-medium text-white text-sm">AI Voice Performer</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Select preferred voice tone and gender for Swarm narrations</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => updateSetting('voiceGender', 'female')}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                        (settings.voiceGender || 'female') === 'female'
                          ? 'bg-white/10 border-white text-white'
                          : 'bg-[#09090b] border-[#222329] text-white/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 size={15} className="text-pink-400" />
                        <span>Female (Natural)</span>
                      </div>
                      {(settings.voiceGender || 'female') === 'female' && <Check size={14} className="text-emerald-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => updateSetting('voiceGender', 'male')}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
                        settings.voiceGender === 'male'
                          ? 'bg-white/10 border-white text-white'
                          : 'bg-[#09090b] border-[#222329] text-white/50 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 size={15} className="text-blue-400" />
                        <span>Male (Natural)</span>
                      </div>
                      {settings.voiceGender === 'male' && <Check size={14} className="text-emerald-400" />}
                    </button>
                  </div>
                </div>

                {/* Specific Browser System Voice Selector & Test Button */}
                <div className="p-4 bg-[#141518] rounded-2xl border border-[#222329] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">System Speech Voice Engine</p>
                      <p className="text-[11px] text-white/40 mt-0.5">Override with specific high-quality browser neural voice</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestVoice}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/10"
                    >
                      <Play size={12} className={isPlayingTestVoice ? "animate-pulse text-emerald-400" : "text-white"} />
                      <span>{isPlayingTestVoice ? "Playing..." : "Test Voice"}</span>
                    </button>
                  </div>
                  <select
                    value={settings.systemVoice || ''}
                    onChange={(e) => updateSetting('systemVoice', e.target.value)}
                    className="w-full bg-[#09090b] border border-[#222329] text-white rounded-xl p-2.5 text-xs outline-none focus:border-white/40"
                  >
                    <option value="">Auto-Select Best System Voice (Default)</option>
                    {availableVoices.map((v, idx) => (
                      <option key={`${v.name}-${idx}`} value={v.name}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Language Selector */}
                <div className="p-4 bg-[#141518] rounded-2xl border border-[#222329] space-y-3">
                  <div>
                    <p className="font-medium text-white text-sm">Default Briefing Language</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Select preferred primary language for voice briefings</p>
                  </div>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full bg-[#09090b] border border-[#222329] text-white rounded-xl p-2.5 text-xs outline-none focus:border-white/40"
                  >
                    <option value="english">English (Global)</option>
                    <option value="hinglish">Hinglish (Colloquial)</option>
                    <option value="hindi">Hindi (हिंदी)</option>
                    <option value="tamil">Tamil (தமிழ்)</option>
                    <option value="telugu">Telugu (తెలుగు)</option>
                    <option value="bengali">Bengali (বাংলা)</option>
                  </select>
                </div>

                {/* Auto-Play Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#141518] rounded-2xl border border-[#222329]">
                  <div>
                    <p className="font-medium text-white text-sm">Auto-Play Voice Narration</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Automatically start voice briefing when schedule is generated</p>
                  </div>
                  <button
                    onClick={() => updateSetting('autoPlayVoice', !settings.autoPlayVoice)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      settings.autoPlayVoice ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        settings.autoPlayVoice ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div className="p-4 bg-[#141518] rounded-2xl border border-[#222329] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">AI Engine Model</p>
                      <p className="text-[11px] text-white/40 mt-0.5">Primary multi-agent orchestration backend</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono rounded-full">Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-[#09090b] border border-white/20 rounded-xl flex items-center gap-3">
                      <Sparkles size={16} className="text-white" />
                      <div>
                        <p className="font-medium text-white text-xs">Gemini 2.5 Flash</p>
                        <p className="text-[10px] text-white/40">Sub-1.5s latency swarm</p>
                      </div>
                    </div>
                    <div className="p-3 bg-[#09090b]/50 border border-[#222329] rounded-xl flex items-center gap-3 opacity-50 cursor-not-allowed">
                      <Cpu size={16} className="text-white/40" />
                      <div>
                        <p className="font-medium text-white/50 text-xs">Ollama Local Swarm</p>
                        <p className="text-[10px] text-white/30">Offline fallback engine</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#141518] rounded-2xl border border-[#222329]">
                  <div>
                    <p className="font-medium text-white text-sm">Show Agent Reasoning Traces</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Display live thought processes and internal state mutations</p>
                  </div>
                  <button
                    onClick={() => updateSetting('showAgentTraces', !settings.showAgentTraces)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                      settings.showAgentTraces ? 'bg-white' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-black transition-transform ${
                        settings.showAgentTraces ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-5">
                <div className="p-4 bg-[#141518] rounded-2xl border border-[#222329] space-y-3">
                  <div>
                    <p className="font-medium text-white text-sm">Clear Application Cache</p>
                    <p className="text-[11px] text-white/40 mt-0.5">Removes saved chat histories and resets local app state</p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-colors font-medium text-xs"
                  >
                    <Trash2 size={14} />
                    <span>Clear Local Cache</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#222329] bg-[#09090b] flex justify-end">
            <button 
              className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors text-xs"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
