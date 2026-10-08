with open("frontend/src/index.css", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Keep imports
imports = re.findall(r'@import .*?;', content)

new_content = "\n".join(imports) + """

/* Grok AI Minimalist Design System */
:root, html.dark {
  color-scheme: dark;
  --bg: #0A0A0A;
  --bg-elevated: #111111;
  --surface: #141414;
  --surface-hover: #1A1A1A;
  --surface-solid: #141414;
  --line: rgba(255, 255, 255, 0.06);
  --line-strong: rgba(255, 255, 255, 0.12);
  --text: #FFFFFF;
  --text-muted: #A0A0A0;
  --text-subtle: #808080;
  --accent: #FF6A3D;
  --accent-soft: #FF6A3D;
  --accent-ring: rgba(255, 106, 61, 0.2);
  --grid-line: rgba(255, 255, 255, 0.03);

  --code-keyword: #4ADE80;
  --code-string: #60A5FA;
  --code-number: #F87171;
  --code-comment: #9CA3AF;
  
  --status-success: #4ADE80;
  --status-success-bg: rgba(74, 222, 128, 0.15);

  --font-sans: 'Inter', system-ui, -apple-system, Roboto, Arial, sans-serif;
  --font-display: 'Inter', system-ui, sans-serif;
}

html.light {
  color-scheme: light;
  --bg: #FCFCFC;
  --bg-elevated: #FFFFFF;
  --surface: #F4F4F3;
  --surface-hover: #F1F1F0;
  --surface-solid: #F4F4F3;
  --line: rgba(0, 0, 0, 0.06);
  --line-strong: rgba(0, 0, 0, 0.12);
  --text: #050505;
  --text-muted: #636363;
  --text-subtle: #888888;
  --accent: #FF6A3D;
  --accent-soft: #FF6A3D;
  --accent-ring: rgba(255, 106, 61, 0.15);
  --grid-line: rgba(0, 0, 0, 0.03);
}

body {
  font-family: var(--font-sans);
  letter-spacing: -0.015em;
  background-color: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
"""

with open("frontend/src/index.css", "w", encoding="utf-8") as f:
    f.write(new_content)
