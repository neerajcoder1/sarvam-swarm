with open("frontend/src/components/Sidebar.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add Info to imports
content = content.replace("LogOut,", "LogOut, Info,")

# Add About link
about_btn = """          <button 
            type="button" 
            className="sidebar-bottom-action-btn w-full flex items-center justify-between hover:bg-[var(--surface-hover)] p-2 rounded-lg transition-colors cursor-pointer mb-1"
            onClick={() => window.location.href = '/about'}
          >
            <div className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              <Info size={16} />
              <span className="text-xs font-semibold">About / Roadmap</span>
            </div>
          </button>
"""

content = re.sub(r'<button \s*type="button" \s*className="sidebar-bottom-action-btn w-full', about_btn + '\n          <button \n            type="button" \n            className="sidebar-bottom-action-btn w-full', content)

with open("frontend/src/components/Sidebar.jsx", "w", encoding="utf-8") as f:
    f.write(content)
