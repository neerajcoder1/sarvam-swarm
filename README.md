# Seedhe code

<div align="center">

### Multi-Agent Productivity & Wellness Swarm Engine

**Smart Campus Hackathon 2026**

**Team:** Seedhe Code

---

[![Build Status](#)](#)
[![License](#)](#)
[![React](#)](#)
[![FastAPI](#)](#)
[![Python](#)](#)
[![Vite](#)](#)
[![Tailwind CSS](#)](#)
[![Ollama](#)](#)

*A resilient AI productivity platform that orchestrates multiple intelligent agents to optimize daily schedules while preserving user wellness through adaptive planning and fault-tolerant AI inference.*

</div>

---

# Table of Contents

- Overview
- Problem Statement
- Solution
- Key Highlights
- System Architecture
- 5-Agent Swarm Workflow
- Defensive Timeout Strategy
- Technology Stack
- Features
- Project Structure
- Installation
- Running the Project
- API Overview
- Future Roadmap
- Contributors
- License

---

# Overview

**SwarmAssist** is an AI-powered productivity orchestration platform built around a **multi-agent swarm architecture**.

Instead of generating a static schedule, the platform coordinates multiple specialized AI agents that collaboratively transform chaotic user tasks into a structured, energy-aware daily execution plan enriched with wellness interventions.

The system has been engineered specifically for **live demonstrations on consumer hardware**, where local Large Language Models may occasionally experience latency. To eliminate UI freezes during inference, the backend introduces an **asynchronous defensive timeout layer** that guarantees uninterrupted frontend responsiveness.

The result is an intelligent scheduling assistant that combines:

- Multi-Agent AI
- Human-centric productivity
- Wellness optimization
- Fault-tolerant AI execution
- Real-time visualization

---

# Problem Statement

Students and professionals often struggle with:

- Unstructured task lists
- Poor prioritization
- Energy crashes throughout the day
- Lack of wellness integration
- AI systems that become unresponsive during slow inference

Traditional productivity applications simply store tasks.

VisionX SwarmAssist actively **reasons** about tasks through a collaborative swarm of AI agents and continuously produces an optimized execution strategy.

---

# Solution

VisionX SwarmAssist employs a **Sequential Multi-Agent Swarm Engine** where each agent owns a dedicated responsibility.

The backend coordinates these agents asynchronously while safeguarding the user experience through intelligent timeout recovery.

Core objectives:

- Optimize productivity
- Reduce decision fatigue
- Preserve cognitive energy
- Maintain responsive UI even when local AI inference stalls
- Deliver explainable scheduling decisions

---

# Key Highlights

## Multi-Agent Swarm Intelligence

Five specialized AI agents collaborate instead of relying on a single monolithic prompt.

---

## Energy-Aware Scheduling

Tasks are ordered according to predicted user productivity windows.

---

## Wellness Injection Engine

The planner inserts:

- Stretch breaks
- Yoga sessions
- Hydration reminders
- Recovery intervals

without sacrificing productivity.

---

## Fault-Tolerant AI Inference

A custom defensive timeout wrapper prevents frontend blocking during slow LLM responses.

---

## Live Agent Visualization

Users observe each AI agent processing sequentially through staggered frontend animations.

---

## Voice Daily Briefing

Native browser Speech Synthesis narrates the generated daily schedule.

---

# System Architecture

```
                    +----------------------+
                    |     React Client     |
                    |   Vite + Tailwind    |
                    +----------+-----------+
                               |
                               |
                         REST API Calls
                               |
                               ▼
                    +----------------------+
                    |      FastAPI API     |
                    +----------+-----------+
                               |
                 Async Request Orchestration
                               |
                               ▼
                 asyncio Timeout Guard Layer
                               |
          +--------------------+--------------------+
          |                                         |
          | Success                                 | Timeout
          ▼                                         ▼
 +----------------------+              +---------------------------+
 | Local Ollama Llama3  |              | Structural Fallback JSON |
 +----------+-----------+              +------------+-------------+
            |                                        |
            +----------------+-----------------------+
                             |
                             ▼
                 JSON Response to Frontend
                             |
                             ▼
           Smooth UI Animations Continue Without Blocking
```

---

# 5-Agent Swarm Workflow

```
                    USER INPUT
                         │
                         ▼
              ┌────────────────────┐
              │ Orchestrator Agent │
              └─────────┬──────────┘
                        │
                        ▼
         ┌────────────────────────────┐
         │ Personalization Agent      │
         │ • Energy Analysis          │
         │ • User Preferences         │
         └─────────┬──────────────────┘
                   │
                   ▼
         ┌────────────────────────────┐
         │ Task Executor Agent        │
         │ • Priority Optimization    │
         │ • Schedule Construction    │
         └─────────┬──────────────────┘
                   │
                   ▼
         ┌────────────────────────────┐
         │ Recommendation Agent       │
         │ • Wellness Injection       │
         │ • Break Optimization       │
         └─────────┬──────────────────┘
                   │
                   ▼
         ┌────────────────────────────┐
         │ Voice Narrator Agent       │
         │ • Daily Summary            │
         │ • Speech Output            │
         └─────────┬──────────────────┘
                   │
                   ▼
             FINAL SCHEDULE
```

---

# Defensive Timeout Strategy

One of the distinguishing engineering decisions in VisionX SwarmAssist is the implementation of an **asynchronous defensive timeout guard**.

During live hackathon demonstrations, locally hosted LLMs may experience variable response times depending on available CPU, RAM, and model size.

Rather than allowing frontend interactions to freeze, the backend wraps every inference request inside an `asyncio.wait_for()` timeout boundary.

If the model responds successfully:

```
LLM Response
      │
      ▼
Processed Normally
```

If inference exceeds the configured timeout:

```
Timeout
      │
      ▼
Fallback JSON
      │
      ▼
Frontend continues animations
```

Benefits include:

- Zero UI blocking
- Reliable live demonstrations
- Predictable response contracts
- Graceful degradation
- Improved user experience under constrained hardware

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Browser Speech Synthesis API

---

## Backend

- FastAPI
- Python
- AsyncIO
- Pydantic
- Uvicorn

---

## AI Layer

- Ollama
- Llama 3

---

## Development Tools

- Git
- GitHub
- VS Code

---

# Features

## Intelligent Multi-Agent Scheduling

Collaborative reasoning through specialized AI agents.

---

## Adaptive Energy Planning

Schedules demanding tasks during peak productivity windows.

---

## Wellness Recommendation Engine

Injects scientifically beneficial recovery intervals into busy schedules.

---

## Explainable Decision Flow

Frontend visualizes every stage of AI reasoning through sequential card animations.

---

## Native Voice Narration

Automatically reads the generated productivity report.

---

## Fault-Tolerant Backend

Maintains uninterrupted UI responsiveness even under degraded AI inference performance.

---

## Modular Architecture

Each AI component can evolve independently without affecting the remaining pipeline.

---

# Project Structure

```
VisionX-SwarmAssist/

│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── App.jsx
│
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── personalization.py
│   │   ├── executor.py
│   │   ├── recommender.py
│   │   └── narrator.py
│   │
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── main.py
│   └── requirements.txt
│
├── README.md
└── LICENSE
```

---

# Installation

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Git
- Ollama
- Llama 3 Model

---

# Windows (PowerShell)

```powershell
git clone <repository-url>

cd VisionX-SwarmAssist

# Backend

cd backend

python -m venv venv

.\venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Open another PowerShell window:

```powershell
cd frontend

npm install

npm run dev
```

Run Ollama:

```powershell
ollama run llama3
```

---

# Linux / macOS

```bash
git clone <repository-url>

cd VisionX-SwarmAssist

cd backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Open another terminal:

```bash
cd frontend

npm install

npm run dev
```

Start Ollama:

```bash
ollama run llama3
```

---

# Running the Project

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:8000
```

Swagger API

```
http://localhost:8000/docs
```

---

# API Overview

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/plan` | POST | Generate optimized productivity schedule |
| `/health` | GET | Service health check |
| `/docs` | GET | Swagger documentation |

---

# Future Roadmap

## Phase 1 — Intelligent Context Awareness

- Google Calendar synchronization
- Microsoft Outlook integration
- Wearable sensor connectivity
- Location-aware planning
- Sleep quality adaptation

---

## Phase 2 — Distributed Swarm Intelligence

Transition from a sequential pipeline toward an **asynchronous Directed Acyclic Graph (DAG)** execution model where independent agents execute concurrently while preserving dependency constraints.

Expected improvements:

- Lower latency
- Parallel reasoning
- Higher throughput
- Better scalability

---

## Phase 3 — Persistent Memory Layer

- PostgreSQL persistence
- Long-term user profiling
- Historical productivity analytics
- Continuous learning

---

## Phase 4 — Hybrid AI Infrastructure

- Automatic Local ↔ Cloud failover
- Dynamic model routing
- Offline-first architecture
- Edge inference optimization

---

## Phase 5 — Predictive Wellness Intelligence

- Stress prediction
- Burnout detection
- Cognitive workload estimation
- Adaptive intervention scheduling
- Personalized wellness recommendations

---

## Phase 6 — Enterprise Collaboration

- Team productivity orchestration
- Shared scheduling agents
- Department workload balancing
- Organizational analytics dashboard

---

# Engineering Innovations

- Sequential Multi-Agent Swarm Architecture
- Asynchronous AI Orchestration
- Defensive Timeout Guard using `asyncio`
- Fault-Tolerant JSON Fallback Pipeline
- Energy-Aware Scheduling Algorithm
- Wellness Injection Engine
- Explainable AI Workflow Visualization
- Local LLM Deployment with Ollama
- Voice-Based Daily Briefing
- Modular, Extensible Backend Design

---

# Contributors

| Name | Role |
|------|------|
| Team Seedhe Code | Full-Stack AI Development |
| Smart Campus Hackathon 2026 | Project Submission |

---

# License

This project is developed for **Smart Campus Hackathon 2026**.

Open-source licensing can be added based on future project requirements.

---

<div align="center">

### SwarmAssist

**Engineering intelligent productivity through collaborative AI agents, resilient system design, and human-centric wellness optimization.**

</div>
