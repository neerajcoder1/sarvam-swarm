import { useState } from 'react'
import {
  Calendar,
  Clock,
  Bell,
  PlusCircle,
  MessageSquare,
  Plus, LogOut, Info, HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Smartphone
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import SwarmLogo from './SwarmLogo'
import MobileAppModal from './MobileAppModal'

const QUICK_ACTIONS = [
  { id: 'plan', label: 'Plan my day', icon: Calendar, prompt: 'Plan my day' },
  { id: 'schedule', label: 'Check schedule', icon: Clock, prompt: "What's my schedule today?" },
  { id: 'reminders', label: 'Set reminders', icon: Bell, prompt: 'Set reminders for today' },
  { id: 'new-chat', label: 'Start new chat', icon: PlusCircle, prompt: '' }
]

const INITIAL_CHAT_HISTORY = [
  { id: '1', title: "Today's priority schedule & break", time: '2h ago', active: true },
  { id: '2', title: 'Healthy lunch recommendations', time: 'Yesterday' },
  { id: '3', title: 'Morning walk & workout routine', time: 'Jul 20' },
  { id: '4', title: 'Evening call reminder', time: 'Jul 18' }
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
  const navigate = useNavigate();
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
        <div
          className="sidebar-backdrop"
          onClick={onToggleOpen}
          aria-hidden="true"
        />
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
        {/* Top: Profile Avatar + Title + Slide Arrow */}
        <div className="sidebar-top-profile">
          <div className="profile-avatar-circle flex items-center justify-center">
            <SwarmLogo size={20} className="text-[var(--text)]" />
          </div>
                    <div className="profile-brand-info">
            <span className="profile-brand-title font-semibold text-lg tracking-tight text-[var(--text)]">
              {(() => {
                const uname = localStorage.getItem('swarm_username');
                return (!uname || uname === 'null' || uname === 'undefined') ? 'Swarm User' : uname;
              })()}
            </span>
          </div>

          <div className="sidebar-top-actions-right">
            <button
              type="button"
              className="sidebar-collapse-btn"
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              className="sidebar-mobile-close"
              onClick={onToggleOpen}
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

                  {/* Quick Actions Section */}
          <div className="sidebar-section">
            <span className="sidebar-section-title">Quick Actions</span>
            <div className="sidebar-nav-list">
              <button
                type="button"
                className="sidebar-item-btn font-semibold text-[var(--accent)]"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('swarm_token');
                    const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/calendar/auth-url`, {
                      headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch (e) {
                    console.error("Calendar auth failed", e);
                  }
                }}
              >
                <Calendar size={15} className="sidebar-item-icon text-[var(--accent)]" />
                <span>Sync Google Calendar</span>
              </button>
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  type="button"
                  className="sidebar-item-btn"
                  onClick={() => {
                    if (action.id === 'new-chat') {
                      if (onNewConversation) onNewConversation()
                    } else if (onSelectAction) {
                      onSelectAction(action.prompt)
                    }
                  }}
                >
                  <Icon size={16} className="sidebar-item-icon" />
                  <span className="sidebar-item-label">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Middle: Clean Chat History List */}
        <div className="sidebar-section sidebar-history-section flex-1 overflow-y-auto">
          {chatHistory.length > 0 ? (
            <>
              <span className="sidebar-section-title">Recent Conversations</span>
              <div className="sidebar-history-list">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    className={`sidebar-history-item ${activeChatId === chat.id ? 'active' : ''}`}
                    onClick={() => handleSelectHistory(chat.id, chat.title)}
                  >
                    <MessageSquare size={15} className="sidebar-item-icon" />
                    <span className="sidebar-history-title" title={chat.title}>
                      {chat.title}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] opacity-50 mt-10">
              <MessageSquare size={24} className="mb-3" />
              <p className="text-xs text-center px-4">Your recent plans will appear here.</p>
            </div>
          )}
        </div>

        {/* Bottom: Theme Toggle + New Conversation Button */}
        <div className="sidebar-bottom-controls flex-col gap-2">
          <button
            type="button"
            className="sidebar-item-btn w-full bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 justify-start font-medium"
            onClick={() => setIsMobileModalOpen(true)}
          >
            <Smartphone size={16} />
            <span>Get Mobile App</span></button><button type="button" className="sidebar-item-btn w-full hover:bg-[var(--surface-hover)] justify-start font-medium mt-2" onClick={() => navigate("/about")}><HelpCircle size={16} /><span>About & Help</span>
          </button>

          <div className="flex flex-row items-center justify-between w-full mt-1">
            <button
              type="button"
              className="new-conversation-btn"
              onClick={() => {
                
                if (onNewConversation) onNewConversation()
              }}
            >
              <Plus size={16} />
              <span>New conversation</span>
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('swarm_token')
                localStorage.removeItem('swarm_email')
                window.location.href = '/'
              }}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-2"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            <div className="sidebar-theme-wrapper">
              <ThemeToggle />
            </div>
          </div>
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
