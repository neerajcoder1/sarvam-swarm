import { useState } from 'react'
import {
  Calendar,
  Clock,
  Bell,
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Smartphone,
  User
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SwarmLogo from './SwarmLogo'
import MobileAppModal from './MobileAppModal'
import ProfileMenu from './ProfileMenu'

const QUICK_ACTIONS = [
  { id: 'plan', label: 'Plan my day', icon: Calendar, prompt: 'Plan my day' },
  { id: 'schedule', label: 'Check schedule', icon: Clock, prompt: "What's my schedule today?" },
  { id: 'reminders', label: 'Set reminders', icon: Bell, prompt: 'Set reminders for today' }
]

export default function Sidebar({
  onSelectAction,
  onNewConversation,
  onToast,
  isOpen,
  onToggleOpen,
  isCollapsed,
  onToggleCollapse,
  chatHistory = [],
  activeChatId,
  onSelectHistory
}) {
  const username = localStorage.getItem('swarm_username') || 'User'
  const firstName = username.split(' ')[0]
  const navigate = useNavigate()
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)

  const handleSelectHistory = (id, title) => {
    if (onSelectHistory) {
      onSelectHistory(id, title)
    } else if (onSelectAction) {
      onSelectAction(title)
    }
  }

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onToggleOpen} aria-hidden="true" />
      )}

      {/* Floating Expand Arrow Button (when collapsed) */}
      {isCollapsed && (
        <button
          type="button"
          className="sidebar-expand-floating-btn"
          onClick={onToggleCollapse}
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <aside className={`permanent-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>

        {/* ── Top bar: Logo + name + collapse btn ── */}
        <div className="sidebar-top-profile cursor-pointer hover:opacity-85 transition-opacity" onClick={() => { if (onNewConversation) onNewConversation() }} title="Swarm Home">
          <div className="profile-avatar-circle flex items-center justify-center">
            <SwarmLogo size={20} className="text-[var(--text)]" />
          </div>
          <div className="profile-brand-info">
            <span className="profile-brand-title font-semibold text-[15px] tracking-tight text-[var(--text)]">
              {(!username || username === 'null' || username === 'undefined') ? 'Swarm User' : username}
            </span>
          </div>
          <div className="sidebar-top-actions-right">
            <button
              type="button"
              className="sidebar-collapse-btn hidden lg:flex"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="sidebar-mobile-close flex lg:hidden"
              onClick={onToggleOpen}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── New conversation button ── */}
        <div className="px-3 pt-2 pb-1">
          <button
            onClick={() => { if (onNewConversation) onNewConversation() }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl hover:bg-[var(--line)] transition-colors text-[var(--text)] font-medium text-[13px] cursor-pointer"
          >
            <Plus size={15} />
            <span>New conversation</span>
          </button>
        </div>

        {/* ── Scrollable middle area ── */}
        <div className="flex-1 overflow-y-auto flex flex-col min-h-0">

          {/* Quick Actions */}
          <div className="px-2 pt-4 pb-2">
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] opacity-60">
              Quick Actions
            </p>
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
              onClick={async () => {
                try {
                  const token = localStorage.getItem('swarm_token')
                  const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/calendar/auth-url`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  const data = await res.json()
                  if (data.url) window.location.href = data.url
                } catch (e) { console.error("Calendar auth failed", e) }
              }}
            >
              <Calendar size={14} className="flex-shrink-0" />
              <span>Sync Google Calendar</span>
            </button>
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
                  onClick={() => { if (onSelectAction) onSelectAction(action.prompt) }}
                >
                  <Icon size={14} className="flex-shrink-0" />
                  <span>{action.label}</span>
                </button>
              )
            })}
          </div>

          {/* Recent Conversations */}
          <div className="px-2 pt-2 pb-2 flex-1">
            {chatHistory.length > 0 ? (
              <>
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)] opacity-60">
                  Recent Conversations
                </p>
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-left transition-colors group ${
                      activeChatId === chat.id
                        ? 'bg-[var(--surface-hover)] text-[var(--text)] font-medium'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                    }`}
                    onClick={() => handleSelectHistory(chat.id, chat.title)}
                  >
                    <MessageSquare size={13} className="flex-shrink-0 opacity-50" />
                    <span className="truncate flex-1">{chat.title}</span>
                  </button>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)] opacity-40">
                <MessageSquare size={20} className="mb-2" />
                <p className="text-[11px] text-center">Your chats will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom: Mobile App + Profile ── */}
        <div className="px-2 pb-3 pt-1 border-t border-[var(--line)] flex flex-col gap-0.5">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors"
            onClick={() => setIsMobileModalOpen(true)}
          >
            <Smartphone size={14} className="flex-shrink-0" />
            <span>Get Mobile App</span>
          </button>

          <ProfileMenu userEmail={localStorage.getItem('swarm_email')} firstName={firstName} />
        </div>
      </aside>

      <MobileAppModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
        onToast={onToast}
      />
    </>
  )
}
