with open("frontend/src/components/Sidebar.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

# Add Calendar sync button to Sidebar
cal_btn = """          {/* Quick Actions Section */}
          <div className="sidebar-section">
            <span className="sidebar-section-title">Quick Actions</span>
            <div className="sidebar-nav-list">
              <button
                type="button"
                className="sidebar-item-btn font-semibold text-[var(--accent)]"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('swarm_token');
                    const res = await fetch(`http://${window.location.hostname}:8000/api/calendar/auth-url`, {
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
              </button>"""

content = re.sub(r'\{\/\* Quick Actions Section \*\/\}\s*<div className="sidebar-section">\s*<span className="sidebar-section-title">Quick Actions</span>\s*<div className="sidebar-nav-list">', cal_btn, content)

with open("frontend/src/components/Sidebar.jsx", "w", encoding="utf-8") as f:
    f.write(content)

with open("frontend/src/pages/Dashboard.jsx", "r", encoding="utf-8") as f:
    dashboard = f.read()

# Add URL search param parsing for calendar_connected
use_effect = """  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('calendar_connected') === 'true') {
      triggerToast("✅ Google Calendar connected securely!");
      window.history.replaceState({}, document.title, "/");
    }
  }, []);"""

dashboard = re.sub(r'const handleBackToHome = \(\) => \{', use_effect + "\n\n  const handleBackToHome = () => {", dashboard)

with open("frontend/src/pages/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.write(dashboard)
