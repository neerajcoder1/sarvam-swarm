<div align="center">

  <img src="logo.png" alt="SwarmAssist Logo" width="160" height="160" />

  # <img width="959" height="437" alt="image" src="https://github.com/user-attachments/assets/21d44da4-7e9f-465e-a519-ac80a840bc3d" />
 SwarmAssist
  ### **AI-Powered Multi-Agent Productivity & Bio-Wellness Engine**

  *Transforming chaotic schedules into intelligent, energy-aware, and explainable execution plans.*

  ---

  [![GitHub Stars](https://img.shields.io/github/stars/neerajcoder1/sarvam-swarm?style=for-the-badge&logo=github&color=gold)](https://github.com/neerajcoder1/sarvam-swarm/stargazers)
  [![GitHub Forks](https://img.shields.io/github/forks/neerajcoder1/sarvam-swarm?style=for-the-badge&logo=github&color=blue)](https://github.com/neerajcoder1/sarvam-swarm/network/members)
  [![GitHub Issues](https://img.shields.io/github/issues/neerajcoder1/sarvam-swarm?style=for-the-badge&logo=github&color=orange)](https://github.com/neerajcoder1/sarvam-swarm/issues)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

  [![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
  [![React](https://img.shields.io/badge/React-18/19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
  [![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
  [![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

  <p align="center">
    <b>Built by Team Seedhe Code</b> for <b>Smart Campus Hackathon 2026</b>
  </p>

  [Explore Features](#-features) •
  [Architecture](#%EF%B8%8F-system-architecture) •
  [Swarm Pipeline](#-multi-agent-swarm-pipeline) •
  [Quick Start](#-quick-start-guide) •
  [API Docs](#-api-reference)

</div>

---

## 📌 Table of Contents

- [📖 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🤖 Multi-Agent Swarm Pipeline](#-multi-agent-swarm-pipeline)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [🛠️ Tech Stack & Infrastructure](#%EF%B8%8F-tech-stack--infrastructure)
- [📂 Project Structure](#-project-structure)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
  - [Environment Configuration](#3-environment-configuration)
- [📡 API Reference](#-api-reference)
- [📸 Screenshots & UI Showcase](#-screenshots--ui-showcase)
- [🛡️ Fault Tolerance & Resilient Parser](#%EF%B8%8F-fault-tolerance--resilient-parser)
- [🗺️ Product Roadmap](#%EF%B8%8F-product-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License & Credits](#-license--credits)

---

## 📖 Overview

**SwarmAssist** (Sarvam Swarm) is an enterprise-grade AI productivity and bio-wellness execution engine. Unlike conventional scheduling tools that rely on rigid static calendars or naive single-prompt LLM calls, SwarmAssist harnesses a **Sequential Multi-Agent Swarm System**.

The platform ingests unstructured natural language inputs (via text or voice), cross-references them with biometric telemetry (sleep history, fatigue metrics, energy constraints), and generates an optimized, time-blocked daily execution schedule complete with localized audio summaries and transparent agent execution traces.

### 💡 Why SwarmAssist?

| Feature | Traditional Schedulers | Single-LLM Prompts | SwarmAssist Multi-Agent Engine |
| :--- | :--- | :--- | :--- |
| **Contextual Planning** | ❌ Manual Input | ⚠️ Unreliable Context | ✅ Biometric & Energy-Aware |
| **Agent Explainability** | ❌ None | ❌ Black-box output | ✅ Interactive Agent Trace Log |
| **Wellness Guardrails** | ❌ Static breaks | ❌ Ignores fatigue | ✅ Dynamic Hydration & Recovery |
| **Multilingual Voice** | ❌ Text only | ❌ Extra integration | ✅ 11+ Languages with STT/TTS |
| **Fault Tolerance** | N/A | ⚠️ Fails on API errors | ✅ Brace-Matching Fallback Engine |

---

## ✨ Key Features

- 🤖 **Sequential Multi-Agent Architecture**: 5 autonomous specialized agents collaborate sequentially to parse intent, align biometrics, build time-blocked schedules, inject wellness interventions, and generate voice briefings.
- ⚡ **Biometric & Energy-Aware Scheduling**: Evaluates energy levels, sleep cycles, and HRV to match demanding tasks with high-cognitive windows while embedding recovery buffers.
- 💙 **Bio-Wellness Recommendation Engine**: Recommends hydration routines, mobility breaks, posture resets, and mental decompression based on real-time task density.
- 🎤 **Multilingual Voice Experience**: Built-in Web Speech API voice synthesis and speech-to-text recognition supporting English, Hindi, Hinglish, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, and Bengali.
- 🔍 **Explainable AI Audit Trace**: Transparent sidebar drawer visualizing live reasoning, confidence metrics, and state mutations from each swarm agent.
- 🛡️ **Defensive Timeout & Resilient State Machine**: Custom JSON brace-matching engine capable of parsing malformed model output and recovering gracefully with deterministic offline fallback generators.
- 📅 **Google Calendar & OAuth Sync**: Instant integration with Google Calendar, enabling bidirectional sync for work and personal routines.

---

## 🤖 Multi-Agent Swarm Pipeline

SwarmAssist splits complex daily planning into **5 specialized agents** executing in strict, deterministic sequence:

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ 1. Orchestrator │ ──► │ 2. Personalizer     │ ──► │ 3. Task Executor    │
│    (Intent)     │     │    (Biometrics)     │     │    (Time-Blocking)  │
└─────────────────┘     └─────────────────────┘     └─────────────────────┘
                                                               │
                                                               ▼
                        ┌─────────────────────┐     ┌─────────────────────┐
                        │ 5. Voice Synthesizer│ ◄── │ 4. Bio-Wellness     │
                        │    (Narration)      │     │    (Recovery)       │
                        └─────────────────────┘     └─────────────────────┘
```

1. 🎯 **Orchestrator Agent (`orchestrator`)**: Ingests raw voice or text prompt, parses user intent, extracts time bounds, and categorizes items into four primary domains (*Work, Energy, Errands, Family*).
2. 👤 **Personalization Agent (`personalization`)**: Ingests fatigue metrics, historical biometrics, and pre-existing calendar commitments to calculate available energy bandwidth.
3. 📅 **Task Executor Agent (`scheduler`)**: Generates optimized time blocks with priority rankings, realistic durations, and time boundaries.
4. 💙 **Bio-Wellness Evaluator (`recommendation`)**: Inspects cognitive load density and injects hydration breaks, physical movement windows, and stress mitigation steps.
5. 🎤 **Voice Synthesizer Agent (`narrator`)**: Converts the final structured schedule into a natural, conversational script tailored for localized speech synthesis.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    A[👤 User Input: Voice STT / Text Prompt] --> B[🌐 Frontend: React 18 + Vite + Tailwind CSS]
    B -->|HTTP POST /api/swarm| C[⚙️ Backend Gateway: FastAPI / Uvicorn]
    
    subgraph Swarm Engine [🤖 Sequential Multi-Agent Swarm Engine]
        C --> D1[🎯 Orchestrator Agent]
        D1 --> D2[👤 Personalization Agent]
        D2 --> D3[📅 Task Executor Agent]
        D3 --> D4[💙 Bio-Wellness Agent]
        D4 --> D5[🎤 Voice Synthesizer Agent]
    end

    subgraph LLM & Fallback Layer
        D1 & D2 & D3 & D4 & D5 <--> E[⚡ Google GenAI - Gemini 2.5 Flash / Ollama]
        E -.->|Timeout / Error| F[🛡️ Brace-Matching JSON Parser & Fallback Engine]
    end

    Swarm Engine --> G[📊 Normalized SwarmResponse JSON]
    G --> H[🎨 React Dashboard & Interactive Agent Trace Drawer]
    G --> I[🔊 Web Speech API Multilingual Voice Narration]
```

---

## 🛠️ Tech Stack & Infrastructure

<div align="center">

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/React_18/19-61DAFB?style=flat-square&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python&logoColor=white) ![Uvicorn](https://img.shields.io/badge/Uvicorn-4053D6?style=flat-square&logo=gunicorn&logoColor=white) |
| **AI / Swarm** | ![Gemini](https://img.shields.io/badge/Google_Gemini_2.5_Flash-8E75B2?style=flat-square&logo=google&logoColor=white) ![Ollama](https://img.shields.io/badge/Ollama_Llama_3-000000?style=flat-square) ![Pydantic](https://img.shields.io/badge/Pydantic_v2-E92063?style=flat-square) |
| **Voice & Speech** | ![Web Speech API](https://img.shields.io/badge/Web_Speech_API-FF6F00?style=flat-square) ![Kokoro Voice Lab](https://img.shields.io/badge/Kokoro_TTS-4A90E2?style=flat-square) |
| **Database & Auth** | ![SQLite](https://img.shields.io/badge/SQLite3-003B57?style=flat-square&logo=sqlite&logoColor=white) ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white) ![PyJWT](https://img.shields.io/badge/JWT_Auth-000000?style=flat-square&logo=json-web-tokens&logoColor=white) |

</div>

---

## 📂 Project Structure

```text
SwarmAssist/
├── 📁 backend/                        # FastAPI Backend Service
│   ├── 📁 venv/                       # Python Virtual Environment
│   ├── 📄 main.py                     # Primary API Entrypoint & Swarm Engine Pipeline
│   ├── 📄 auth.py                     # Password Hashing & JWT Authentication Utilities
│   ├── 📄 auth_router.py              # User Registration, Login & Profile Routes
│   ├── 📄 calendar_router.py          # Google Calendar Sync & Event Routes
│   ├── 📄 database.py                 # SQLite Engine & Session Configuration
│   ├── 📄 models.py                   # SQLAlchemy Database Models
│   ├── 📄 schemas.py                  # Pydantic Schemas & Swarm Contracts
│   ├── 📄 prompts.py                  # Multi-Agent System Prompts & Instructions
│   ├── 📄 refactor.py                 # Core Helper Functions & Formatting Utilities
│   ├── 📄 requirements.txt            # Python Dependencies
│   └── 📄 swarm.db                    # Local SQLite Database
│
├── 📁 frontend/                       # React 18 + Vite Frontend Application
│   ├── 📁 public/                     # Static Assets & Icons
│   │   └── 📄 favicon.svg
│   ├── 📁 src/
│   │   ├── 📁 agents/                 # Frontend Agent Adapters & Mocks
│   │   ├── 📁 components/             # Reusable UI Components
│   │   │   ├── 📄 AgentTraceDrawer.jsx # Explainable AI Audit Drawer
│   │   │   ├── 📄 Navbar.jsx          # Header Navigation & Profile Menu
│   │   │   ├── 📄 ScheduleTimeline.jsx# Time-Blocked Visual Timeline
│   │   │   └── 📄 VoicePlayer.jsx     # Multilingual Speech Player
│   │   ├── 📁 pages/                  # Page Views (Dashboard, History, Settings)
│   │   ├── 📄 App.jsx                 # Application Shell & Router Configuration
│   │   ├── 📄 App.css                 # Custom Styling & Animations
│   │   ├── 📄 index.css               # Tailwind CSS Imports
│   │   └── 📄 main.jsx                # React DOM Mount Entrypoint
│   ├── 📄 package.json                # Node.js Dependencies & Scripts
│   └── 📄 vite.config.js              # Vite Build Configuration
│
├── 📁 Voice-Testing/                  # Kokoro Voice Lab & TTS Experimentation
│   └── 📁 kokoro-voice-lab/           # Local Hindi/English Audio Generation Scripts
│
├── 📄 PROJECT_PRD_BRIEF.md            # Complete Product Requirement Document
├── 📄 README.md                       # Comprehensive Project Documentation
└── 📄 vercel.json                     # Vercel Deployment Configuration
```

---

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following software installed:
- **Node.js**: `v18.0.0` or higher ([Download](https://nodejs.org/))
- **Python**: `3.10` or higher ([Download](https://python.org/))
- **Git**: Installed and configured ([Download](https://git-scm.com/))

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Start the FastAPI Uvicorn development server
uvicorn main:app --reload --port 8000
```

The backend server will launch at `http://localhost:8000`. API Documentation is available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

### 3. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Gemini API Key (Required for AI Swarm Execution)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Secret key for JWT Token Signing
SECRET_KEY=your_super_secret_jwt_key_here

# Database Connection (Default: SQLite)
DATABASE_URL=sqlite:///./swarm.db

# Optional: Google OAuth Credentials (for Calendar Sync)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 📡 API Reference

### Main Endpoints Overview

| Method | Endpoint | Description | Request Payload / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/swarm` | Executes the 5-Agent Swarm Pipeline | `{ "prompt": "String", "user_profile": {} }` |
| `GET` | `/health` | Health Check & Service Status | None |
| `POST` | `/api/auth/register` | User Account Creation | `{ "email": "...", "password": "..." }` |
| `POST` | `/api/auth/login` | User Authentication (JWT) | `{ "username": "...", "password": "..." }` |
| `GET` | `/api/calendar/events` | Fetch User Calendar Commitments | Authorization Header |
| `POST` | `/api/calendar/sync` | Sync Swarm Schedule to Calendar | `{ "events": [...] }` |

---

### Sample `/api/swarm` Payload

#### Request:
```json
{
  "prompt": "I have an intense coding day ahead with 3 client calls in the afternoon. Slept only 5 hours last night.",
  "language": "en",
  "preferences": {
    "prefer_breaks": true,
    "max_focus_block_mins": 90
  }
}
```

#### Response:
```json
{
  "status": "success",
  "execution_time_ms": 1140,
  "data": {
    "schedule": [
      {
        "time": "09:00 - 10:30",
        "task": "Deep Work: Core Architecture Implementation",
        "domain": "Work",
        "energy_cost": "High",
        "priority": "P1"
      },
      {
        "time": "10:30 - 10:45",
        "task": "Hydration & Decompression Break",
        "domain": "Energy",
        "energy_cost": "Recovery",
        "priority": "P0"
      }
    ],
    "wellness_recommendations": [
      "Injected 15-min recovery window due to 5h sleep detection.",
      "Hydration reminder scheduled before 14:00 client call."
    ],
    "voice_summary": "Good morning! I've structured your high-focus coding block early when your energy peaks, followed by built-in recovery buffers before your afternoon calls.",
    "agent_traces": [
      {
        "agent": "Orchestrator",
        "status": "SUCCESS",
        "reasoning": "Identified high-cognitive work + 3 client calls."
      },
      {
        "agent": "Personalizer",
        "status": "SUCCESS",
        "reasoning": "Flagged sleep deficit (5h); enforced strict 90-min max focus cap."
      }
    ]
  }
}
```

---

## 📸 Screenshots & UI Showcase

> *Screenshots from the SwarmAssist Production Build*

<div align="center">

| 📊 Interactive Dashboard | 🤖 Agent Trace Drawer |
|:-------------------------:|:---------------------:|
| <img width="959" height="437" alt="image" src="https://github.com/user-attachments/assets/02cf4559-6898-40a8-9a0a-26ea317af3e6" /> | *(Live reasoning view)* |

</div>

---

## 🛡️ Fault Tolerance & Resilient Parser

SwarmAssist implements a **multi-layered defensive architecture** to guarantee system uptime even under upstream API delays or LLM output format drifts:

1. **30-Second Client Timeout Window**: Protects the client UI from hanging during peak API load.
2. **JSON Brace-Matching State Machine**: Custom regex and token scanner extracts valid JSON trees even when raw LLM responses contain markdown code block wrappers or trailing commentary.
3. **Deterministic Fallback Engine**: If upstream providers fail, a keyword-driven fallback generator seamlessly delivers a high-quality schedule without interrupting user flow.

---

## 🗺️ Product Roadmap

- [x] 🤖 5-Agent Sequential Swarm Core Architecture
- [x] 🎤 Multilingual Web Speech API (STT & TTS)
- [x] 🔍 Interactive Explainable AI Trace Drawer
- [x] 🛡️ Fault-Tolerant JSON Brace-Matching Parser
- [x] 📅 Google Calendar OAuth Integration
- [ ] ⌚ Apple Health & Fitbit Biometric API Integration
- [ ] 🌐 Multi-User Team Swarm Collaboration Mode
- [ ] 📱 React Native Mobile Application (iOS / Android)

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve SwarmAssist:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m "feat: Add amazing new feature"
   ```
4. **Push to your Branch**:
   ```bash
   git push origin feature/amazing-new-feature
   ```
5. **Open a Pull Request** with a detailed summary of changes.

---

## 📄 License & Credits

### License
This project is open-source under the **[MIT License](LICENSE)**.

### Team & Acknowledgments
- **Team**: **Seedhe Code**
- **Hackathon**: **Smart Campus Hackathon 2026**
- **AI Core**: Google Gemini 2.5 Flash, Ollama, Llama 3
- **Voice Lab**: Kokoro TTS & Web Speech API

---

<div align="center">

  <b>Made with ❤️ by Team Seedhe Code</b>

  ⭐ *If you find SwarmAssist useful, give this repository a star on GitHub!* ⭐

</div>
