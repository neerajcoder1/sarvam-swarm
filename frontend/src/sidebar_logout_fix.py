with open("frontend/src/components/Sidebar.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add LogOut to imports
content = content.replace("Plus,", "Plus, LogOut,")

new_bottom = """<div className="flex flex-row items-center justify-between w-full mt-1">
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

            <button
              onClick={() => {
                localStorage.removeItem('swarm_token')
                localStorage.removeItem('swarm_email')
                window.location.href = '/auth'
              }}
              className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-2"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>

            <div className="sidebar-theme-wrapper">
              <ThemeToggle />
            </div>
          </div>"""

content = re.sub(r'<div className="flex flex-row items-center justify-between w-full mt-1">.*?</div>\s*</div>\s*</div>\s*</aside>', new_bottom + "\n        </div>\n      </aside>", content, flags=re.DOTALL)

with open("frontend/src/components/Sidebar.jsx", "w", encoding="utf-8") as f:
    f.write(content)
