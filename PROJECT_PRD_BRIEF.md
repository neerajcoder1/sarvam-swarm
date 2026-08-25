# SwarmAssist (Sarvam Swarm) - System Architecture & Product Requirement Document

> **Target Audience**: Software Engineers, Technical Architects, and Large Language Models.
> **Document Purpose**: Serves as an authoritative Product Requirement Document (PRD), System Architecture Blueprint, and Technical Specification for **SwarmAssist**. Designed to provide complete technical context for seamless downstream development.

---

## 1. Executive Summary & Product Strategy

### 1.1 Product Overview
**SwarmAssist** is an enterprise-grade AI productivity and personal execution engine. Unlike conventional scheduling tools that rely on static calendars or naive single-prompt LLM calls, SwarmAssist utilizes a **Sequential Multi-Agent Swarm System**. The system ingests natural language prompts, evaluates individual energy constraints and historical biometrics (HRV, sleep telemetry), and outputs an optimized, time-blocked daily execution plan paired with a localized, human-centric voice summary.

### 1.2 Architectural Objectives
- **Explainability**: Every state mutation and recommendation within the schedule is traceable back to a discrete agent's execution log.
- **Fault Tolerance**: Multi-tiered retry mechanisms and dynamic fallback generators ensure absolute system availability despite downstream LLM latencies or output malformations.
- **Latency Optimization**: Strict token budgeting and JSON schema recovery state machines minimize round-trip times to under 1.5 seconds under normal operation.
- **Localization**: Native support for 11 regional and global languages with dialect-aware voice synthesis mapping.

---

## 2. System Capabilities & Feature Matrix

| Functional Module | Architectural Implementation & Scope |
| :--- | :--- |
| **Multi-Agent Orchestration** | 5 specialized sequential agents: Intent Parser (Orchestrator), Profile Synchronizer (Personalization), Time-Block Scheduler (Task Executor), Bio-Wellness Evaluator (Recommendation), and Voice Synthesizer (Narrator). |
| **Energy & Biometric Scheduling** | Injects buffer windows, hydration routines, physical decompression blocks, and nutritional supplements adjacent to high-cognitive-load events. |
| **Multilingual Voice Narration** | Contextual voice generation supporting English, Hindi, Hinglish, Tamil, Kannada, Telugu, Malayalam, Marathi, Gujarati, Punjabi, and Bengali. |
| **Speech-to-Text Input** | Web Speech API integration with custom voice-activity detection heuristics and fallback text simulation. |
| **Resilient JSON Engine** | Custom brace-matching state machine to extract valid JSON objects from unstructured model outputs, bypassing raw markdown wrappers. |
| **Defensive Timeout Architecture** | 30-second client timeout, 2-stage prompt retry pipeline, and static offline fallback generators. |
| **Agent Trace Drawer** | Transparent audit log panel rendering internal agent reasoning and intent resolution logic. |

---

## 3. System Architecture Diagram

```text
               User Input Layer (Voice STT / Natural Language Text)
                                       │
                                       ▼
            Frontend Client (React 18 + Vite + Tailwind CSS + Framer Motion)
                                       │
                         [HTTP POST /api/swarm Pipeline]
                                       │
                                       ▼
                     Backend API Gateway (FastAPI / Uvicorn)
                                       │
           ┌───────────────────────────┴───────────────────────────┐
           ▼                                                       ▼
   Google GenAI SDK                                       Fallback Response Engine
   (Gemini 2.5 Flash / 30s Timeout)                       (Deterministic Keyword Matcher)
           │                                                       │
           └───────────────────────────┬───────────────────────────┘
                                       │
                                       ▼
                    Sequential Swarm Pipeline Processing
     ┌───────────────────────────────────────────────────────────────────┐
     │  1. Orchestrator Agent       -> Intent Parsing & Domain Splitting │
     │  2. Personalization Agent   -> Health Signal & Calendar Sync      │
     │  3. Task Executor Agent     -> Time-Blocked Queue Generation      │
     │  4. Recommendation Agent    -> Energy & Wellness Mitigation       │
     │  5. Voice Narrator Agent    -> Colloquial Narration Scripting    │
     └───────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                    Normalized SwarmResponse Schema Validation
                                       │
                                       ▼
               Browser SpeechSynthesis Engine (Multilingual Audio)
```

---

## 4. Technical Stack & Infrastructure Specification

### 4.1 Frontend Layer
- **Core Framework**: React 18.x, Vite build engine, React Router DOM v6
- **UI & Layout**: Tailwind CSS, custom design tokens (`App.css`, `index.css`, `premium.css`), Dark/Light CSS variable theme switching
- **Motion & Layout Engine**: Framer Motion (staggered pipeline rendering, layout animations, drawer overlays)
- **Component Primitives**: Lucide React icon suite
- **Browser Audio Services**: Native Web Speech API (`SpeechSynthesisUtterance` for TTS, `SpeechRecognition` / `webkitSpeechRecognition` for STT)

### 4.2 Backend Layer
- **Application Framework**: FastAPI v0.100+, Uvicorn ASGI Web Server
- **Inference Runtime**: `google-genai` (v2.11.0) client interacting with `gemini-2.5-flash`
- **Validation & Serialization**: Pydantic v2 data models, standard Python regex state machine parser
- **Environment & Configuration**: `python-dotenv` for operational key management

---

## 5. Multi-Agent Pipeline Specifications

### 5.1 Orchestrator Agent (`orchestrator`)
- **Domain Scope**: Ingests raw input string, performs intent extraction, isolates time constraints, and partitions tasks into four domains: Work, Energy, Errands, Family.
- **Trace Contract**: Returns intent resolution and agent delegation graph.

### 5.2 Personalization Agent (`personalization`)
- **Domain Scope**: Ingests baseline biometric flags (e.g., short sleep cycles, reduced HRV), user preferences (e.g., preferred call times), and pre-existing calendar commitments.
- **Trace Contract**: Returns calendar adjustments and fatigue mitigation flags.

### 5.3 Task Executor Agent (`task-executor`)
- **Domain Scope**: Constructs the chronological task sequence, assigning definitive start times, operational descriptions, and mandatory 15-minute inter-task transition buffers.
- **Trace Contract**: Returns the formatted task queue structure.

### 5.4 Recommendation Agent (`recommendation`)
- **Domain Scope**: Scans schedule for high-stress blocks (e.g., key presentations) and inserts energy interventions (light exercise, hydration, protein intake) prior to the event.
- **Trace Contract**: Returns bio-hacking and wellness injection logic.

### 5.5 Voice Narrator Agent (`voice-narrator`)
- **Domain Scope**: Synthesizes execution plan into a warm, companion-style verbal summary matching the detected user language and localized phonetic nuances.
- **Trace Contract**: Returns voice engine parameters and script confirmation.

---

## 6. API Data Contracts & Protocols

### Endpoint: `POST /api/swarm`

#### Request Payload
```json
{
  "query": "Plan my day. I have a presentation at 3 PM, feeling low on energy, need groceries, and call mom."
}
```

#### Response Payload (`SwarmResponse`)
```json
{
  "agents": [
    {
      "id": "orchestrator",
      "name": "Orchestrator",
      "workingStatus": "Splitting your request...",
      "doneStatus": "Request split into 4 life domains — work, energy, errands, family.",
      "trace": "Parsed user intent: client presentation @ 3 PM (high priority)..."
    },
    {
      "id": "personalization",
      "name": "Personalization Agent",
      "workingStatus": "Checking health + family profile...",
      "doneStatus": "Profile synced — energy dip pattern noted...",
      "trace": "Health baseline: sleep 6.2h last night..."
    },
    {
      "id": "task-executor",
      "name": "Task Executor Agent",
      "workingStatus": "Creating prioritized tasks...",
      "doneStatus": "5 tasks sequenced with time blocks and buffer zones.",
      "trace": "Task queue built: (1) Morning energy routine..."
    },
    {
      "id": "recommendation",
      "name": "Recommendation Agent",
      "workingStatus": "Suggesting energy booster...",
      "doneStatus": "Energy boosters added — light walk + protein snack...",
      "trace": "Low energy mitigation: recommend 12-min walk..."
    },
    {
      "id": "voice-narrator",
      "name": "Voice Narrator Agent",
      "workingStatus": "Speaking in natural Hinglish...",
      "doneStatus": "Voice narration ready.",
      "trace": "Generated Hinglish narration for voice synthesis..."
    }
  ],
  "tasks": [
    {
      "time": "8:00 AM",
      "title": "Morning energy routine",
      "description": "15-min stretch + hydration + light breakfast — energy foundation set.",
      "status": "done"
    },
    {
      "time": "10:30 AM",
      "title": "Grocery run",
      "description": "Quick 25-min errand block — list pre-loaded from pantry scan.",
      "status": "done"
    },
    {
      "time": "2:30 PM",
      "title": "Pre-presentation prep",
      "description": "Review slides + 12-min walk + protein snack — energy boost before client call.",
      "status": "done"
    },
    {
      "time": "3:00 PM",
      "title": "Client presentation",
      "description": "High-focus block — swarm silenced notifications, calendar protected.",
      "status": "done"
    },
    {
      "time": "6:30 PM",
      "title": "Call mom + family time",
      "description": "Evening wind-down — 20-min call with mom, then family dinner block.",
      "status": "done"
    }
  ],
  "voice_narration": "Priya, your schedule for today is ready! Starting with a morning energy routine...",
  "voice_settings": {
    "language": "english",
    "locale": "en-US",
    "gender": "female",
    "style": "friendly",
    "speaking_rate": 1.0,
    "pitch": 1.0,
    "voice_personality": "American conversational female"
  },
  "detected_language": {
    "language": "english",
    "confidence": 0.98,
    "source": "llm"
  }
}
```

---

## 7. Language Inference & Speech Synthesis Subsystem

1. **Language Normalization**: Inputs map to standard language identifiers (`english`, `hindi`, `hinglish`, `tamil`, `kannada`, `telugu`, `malayalam`, `marathi`, `gujarati`, `punjabi`, `bengali`).
2. **Heuristic Detection Engine**: Evaluates character code ranges (e.g., Devanagari script `\u0900-\u097F`) and colloquial Romanized lexicons (`kal`, `aaj`, `yaar`, `bro`, `hai`) when LLM confidence is low or offline.
3. **Voice Selection Algorithm (`speech.js`)**:
   - Queries `window.speechSynthesis.getVoices()`.
   - Filters voices by locale priority (`en-IN` -> `hi-IN` -> `en-US`).
   - Applies name-matching heuristics for female voice preference (`Sangeeta`, `Swara`, `Heera`, `Jenny`, `Aria`, `Samantha`, `Zira`).
   - Resolves Chrome/Edge async `voiceschanged` initialization delays via event listener hooks.

---

## 8. Directory & File Blueprint

```text
Sarwam Swarm/
├── backend/
│   ├── main.py              # FastAPI application, Gemini integration, state machine JSON repair, fallback engine
│   └── requirements.txt     # Service dependencies
├── frontend/
│   ├── package.json         # Frontend manifest
│   ├── vite.config.js       # Vite bundler configuration
│   └── src/
│       ├── App.jsx          # Application entry route & theme configuration
│       ├── App.css / index.css / premium.css # Enterprise CSS tokens & glassmorphic styles
│       ├── main.jsx         # DOM mount entry
│       ├── agents/
│       │   ├── orchestrator.js # API communication orchestrator & staggered UI execution controller
│       │   └── speech.js       # SpeechSynthesis & SpeechRecognition wrapper modules
│       ├── components/
│       │   ├── AgentTracePanel.jsx  # Audit drawer rendering agent reasoning
│       │   ├── DashboardShell.jsx   # Layout wrapper component
│       │   ├── DayPlanOutput.jsx    # Schedule list view & TTS controller
│       │   ├── LiveSwarmView.jsx    # Swarm pipeline grid view
│       │   ├── SwarmAgentCard.jsx   # Agent execution status card
│       │   └── SwarmInput.jsx       # Input controls (Voice/Text)
│       ├── data/
│       │   └── agents.js    # Data constants and schema fallbacks
│       └── pages/
│           └── Dashboard.jsx # Central state management page
├── PROJECT_PRD_BRIEF.md     # Authoritative System Architecture & PRD Document
└── README.md                # General repository information
```

---

## 9. Environment Setup & Execution Protocol

### 9.1 Backend Microservice
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Service binds to `http://localhost:8000`.*

### 9.2 Frontend Client
```bash
cd frontend
npm install
npm run dev
```
*Client binds to `http://localhost:5173`.*

---

## 10. Technical Roadmap & Recommended Extensions

Downstream engineering tasks recommended for senior developers extending this platform:

1. **Enterprise Persistence & Two-Way Calendar Integration**:
   - Implement OAuth2 authentication for Google Workspace / Microsoft 365.
   - Sync real-time free/busy blocks and write generated schedule items back to external calendar providers via REST APIs.
   - Store user preferences and telemetry in PostgreSQL / Supabase.

2. **Server-Sent Events (SSE) / WebSocket Streaming**:
   - Replace HTTP POST polling with a streaming architecture to push agent execution logs in real time as each agent completes its evaluation cycle.

3. **Multi-Modal Syllabus & Timetable Parsing**:
   - Integrate multimodal vision processing to convert image uploads of physical whiteboards, timetables, or PDF syllabi into structured swarm inputs.

4. **Cloud Neural TTS Gateway**:
   - Integrate Sarvam AI Samvaad or ElevenLabs WebSockets as an enterprise fallback for native browser speech synthesis.
