with open("frontend/src/pages/Dashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re
content = re.sub(
    r'className="px-4 py-1.5 rounded-lg border border-\[var\(--line\)\] hover:border-\[var\(--accent\)\] text-xs font-semibold text-\[var\(--text-muted\)\] hover:text-\[var\(--text\)\] transition-all cursor-pointer"\s*>\s*Reset Dashboard',
    r'className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)] text-sm font-medium text-[var(--text)] shadow-sm hover:shadow-md transition-all cursor-pointer">\n                  <RefreshCw size={14} className="opacity-70" />\n                  <span>Reset Dashboard</span>',
    content
)

with open("frontend/src/pages/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.write(content)
