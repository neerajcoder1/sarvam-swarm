/** Agent definitions for the live swarm orchestration flow */
export const SWARM_AGENTS = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    workingStatus: 'Splitting your request…',
    doneStatus: 'Request split into 4 life domains — work, energy, errands, family.',
    trace:
      'Parsed user intent: client presentation @ 3 PM (high priority), low energy signal detected, grocery errand flagged, evening family call scheduled. Routing to Personalization Agent for profile context.',
  },
  {
    id: 'personalization',
    name: 'Personalization Agent',
    workingStatus: 'Checking health + family profile…',
    doneStatus: 'Profile synced — energy dip pattern noted, mom call preference: evening.',
    trace:
      'Health baseline: sleep 6.2h last night, HRV slightly low. Family profile: mom prefers calls after 6 PM. Priya\'s calendar shows back-to-back meetings until 2 PM. Adjusting plan for energy recovery before 3 PM presentation.',
  },
  {
    id: 'task-executor',
    name: 'Task Executor Agent',
    workingStatus: 'Creating prioritized tasks…',
    doneStatus: '5 tasks sequenced with time blocks and buffer zones.',
    trace:
      'Task queue built: (1) Morning energy routine 8:00, (2) Grocery run 10:30, (3) Pre-presentation prep 2:30, (4) Client presentation 3:00, (5) Call mom 6:30. Added 15-min transitions between blocks.',
  },
  {
    id: 'recommendation',
    name: 'Recommendation Agent',
    workingStatus: 'Suggesting energy booster…',
    doneStatus: 'Energy boosters added — light walk + protein snack before presentation.',
    trace:
      'Low energy mitigation: recommend 12-min walk at 2:15 PM + banana-almond snack at 2:25 PM. Avoid caffeine after 4 PM to protect evening sleep. Grocery trip timed during natural energy lull (10:30 AM).',
  },
  {
    id: 'voice-narrator',
    name: 'Voice Narrator Agent',
    workingStatus: 'Speaking in natural Hinglish…',
    doneStatus: 'Day plan narrated — ready for Sarvam Samvaad voice output.',
    trace:
      'Generated Hinglish narration for voice synthesis. Tone: warm, confident, concise. Mapped to Sarvam Samvaad TTS pipeline. Output queued for fellow teammates.',
  },
]

export const DEFAULT_SWARM_INPUT =
  'Hey Swarm, plan my day. I have a client presentation at 3 PM, feeling low on energy, need to buy groceries, and call mom in the evening.'

export const DAY_PLAN_TASKS = [
  {
    time: '8:00 AM',
    title: 'Morning energy routine',
    description: '15-min stretch + hydration + light breakfast — energy foundation set.',
    status: 'done',
  },
  {
    time: '10:30 AM',
    title: 'Grocery run',
    description: 'Quick 25-min errand block — list pre-loaded from pantry scan.',
    status: 'done',
  },
  {
    time: '2:30 PM',
    title: 'Pre-presentation prep',
    description: 'Review slides + 12-min walk + protein snack — energy boost before client call.',
    status: 'done',
  },
  {
    time: '3:00 PM',
    title: 'Client presentation',
    description: 'High-focus block — swarm silenced notifications, calendar protected.',
    status: 'done',
  },
  {
    time: '6:30 PM',
    title: 'Call mom + family time',
    description: 'Evening wind-down — 20-min call with mom, then family dinner block.',
    status: 'done',
  },
]

export const VOICE_NARRATION =
  'Priya, aaj ka plan ready hai! Subah energy boost se start, dopahar presentation ke liye prep aur snack, shaam ko groceries aur maa ko call — sab time pe set hai. Tum bas follow karo, swarm handle karega!'
