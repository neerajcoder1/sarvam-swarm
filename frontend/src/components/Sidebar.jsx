import { useState } from 'react'
import {
  Calendar,
  Clock,
  Bell,
  PlusCircle,
  MessageSquare,
  Plus,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import SwarmLogo from './SwarmLogo'

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
  isOpen,
  onToggleOpen,
  isCollapsed,
  onToggleCollapse
}) {
  const [history, setHistory] = useState(INITIAL_CHAT_HISTORY)
  const [activeChatId, setActiveChatId] = useState('1')

  const handleSelectHistory = (id, title) => {
    setActiveChatId(id)
    if (onSelectAction) {
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
            <span className="profile-brand-title">Sarvam Swarm</span>
            <span className="profile-brand-tag">Life Co-Pilot</span>
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
        <div className="sidebar-section sidebar-history-section">
          <span className="sidebar-section-title">Recent Conversations</span>
          <div className="sidebar-history-list">
            {history.map((chat) => (
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
        </div>

        {/* Bottom: Theme Toggle + New Conversation Button */}
        <div className="sidebar-bottom-controls">
          <button
            type="button"
            className="new-conversation-btn"
            onClick={() => {
              setActiveChatId(null)
              if (onNewConversation) onNewConversation()
            }}
          >
            <Plus size={16} />
            <span>New conversation</span>
          </button>

          <div className="sidebar-theme-wrapper">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  )
}
