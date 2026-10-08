import os

files = ['frontend/src/pages/Auth.jsx', 'frontend/src/agents/orchestrator.js']

for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("'http://${window.location.hostname}:8000/api/auth/login'", "`http://${window.location.hostname}:8000/api/auth/login`")
    content = content.replace("'http://${window.location.hostname}:8000/api/auth/register'", "`http://${window.location.hostname}:8000/api/auth/register`")
    content = content.replace("'http://${window.location.hostname}:8000/api/swarm'", "`http://${window.location.hostname}:8000/api/swarm`")
    content = content.replace("'http://${window.location.hostname}:8000/api/tts'", "`http://${window.location.hostname}:8000/api/tts`")

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

