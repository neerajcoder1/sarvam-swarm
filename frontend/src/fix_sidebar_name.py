with open("frontend/src/components/Sidebar.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Replace the profile-brand-info div
new_profile_brand_info = """          <div className="profile-brand-info">
            <span className="profile-brand-title font-semibold text-lg tracking-tight text-[var(--text)]">
              {(() => {
                const uname = localStorage.getItem('swarm_username');
                return (!uname || uname === 'null' || uname === 'undefined') ? 'Swarm User' : uname;
              })()}
            </span>
          </div>"""

content = re.sub(r'<div className="profile-brand-info">.*?</div>', new_profile_brand_info, content, flags=re.DOTALL)

with open("frontend/src/components/Sidebar.jsx", "w", encoding="utf-8") as f:
    f.write(content)
