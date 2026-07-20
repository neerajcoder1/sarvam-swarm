import json
import logging
import re
import copy
import traceback
import time
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables (e.g. from .env file during development)
load_dotenv()

# Initialize a single reusable Google GenAI client with a 30-second timeout
api_key = os.environ.get("GEMINI_API_KEY")
client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(timeout=30_000)
)


# Set up logging matching strict requirements: no unnecessary verbose logs.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("swarm_backend")

app = FastAPI(title="Sarvam Swarm Backend", version="1.0.0")

# 1. WIDE-OPEN CORS MIDDLEWARE FOR FRONTEND COMPATIBILITY
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# CONFIGURABLE MODEL & SYSTEM CONSTANTS
# ==========================================

# Language configuration mapping for multilingual provider-agnostic voice settings and fallback tasks
LANGUAGE_CONFIGS = {
    "english": {
        "aliases": ["english", "en", "en-us"],
        "locale": "en-US",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "American conversational female",
        "tone": "warm and friendly",
        "energy": "medium-high",
        "formality": "casual",
        "fallback_narration": "Priya, your schedule for '{trunc_query}' is ready! All tasks have been set on time, just follow the plan and the swarm will handle the rest.",
        "fallback_tasks": {
            "lunch": {
                "title": "Healthy lunch suggestion",
                "description": "Enjoy a fresh salad + high-protein meal near your location as recommended by swarm.",
                "narration": "Priya, your plan for '{trunc_query}' is ready with a healthy lunch update! Fresh options are set and evening tasks are lined up. Just follow, the swarm will handle it!"
            },
            "break": {
                "title": "30 min relaxation break",
                "description": "Swarm scheduled a 30-min break to recharge. Notifications muted.",
                "narration": "Priya, your plan for '{trunc_query}' is set with stress-free breaks. Buffer zones have been included for relaxation. Just follow, the swarm will handle it!"
            },
            "meeting": {
                "title": "Important client meeting",
                "description": "High-priority meeting sync. Swarm has prepped details and muted background notifications.",
                "narration": "Priya, your client meeting for '{trunc_query}' is scheduled. Calendar protected and ready to go!"
            },
            "coding": {
                "title": "Deep work coding session",
                "description": "2-hour uninterrupted block for coding and system architecture design.",
                "narration": "Priya, a deep work coding session has been allocated for '{trunc_query}'. Go complete the code distraction-free!"
            },
            "study": {
                "title": "Focused study session",
                "description": "Reviewing research papers and system optimization guides. Phone set to DND.",
                "narration": "Priya, a morning study block is prioritized for '{trunc_query}'. Study hard, the swarm will track!"
            },
            "travel": {
                "title": "Travel slot & commute",
                "description": "Travel to destination. Swarm verified the route, traffic looks clear.",
                "narration": "Priya, your travel route has been updated for '{trunc_query}'. Commute and schedule will be smooth!"
            }
        }
    },
    "hindi": {
        "aliases": ["hindi", "hi", "hi-in"],
        "locale": "hi-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Indian female",
        "tone": "warm and calm",
        "energy": "medium",
        "formality": "polite",
        "fallback_narration": "प्रिया, आपकी क्वेरी '{trunc_query}' के लिए स्वार्म प्लान तैयार है! सभी कार्य समय पर सेट हैं, आप बस फॉलो करें, स्वार्म संभाल लेगा!",
        "fallback_tasks": {
            "lunch": {
                "title": "स्वस्थ लंच का सुझाव",
                "description": "स्वार्म द्वारा सुझाए गए अपने स्थान के पास एक ताज़ा सलाद + उच्च-प्रोटीन भोजन का आनंद लें।",
                "status": "done",
                "narration": "प्रिया, आपकी क्वेरी '{trunc_query}' के लिए लंच ब्लॉक के साथ प्लान तैयार है! हेल्दी भोजन के विकल्प सेट हैं। आप बस फॉलो करें, स्वार्म संभाल लेगा!"
            },
            "break": {
                "title": "30 मिनट का विश्राम",
                "description": "स्वार्म ने आराम करने के लिए 30 मिनट का ब्रेक शेड्यूल किया है। नोटिफिकेशन म्यूट हैं।",
                "status": "done",
                "narration": "प्रिया, आपकी क्वेरी '{trunc_query}' के लिए ब्रेक सेट कर दिए गए हैं! आज का दिन तनाव मुक्त रहेगा। आप बस फॉलो करें, स्वार्म संभाल लेगा!"
            },
            "meeting": {
                "title": "महत्वपूर्ण क्लाइंट मीटिंग",
                "description": "उच्च-प्राथमिकता वाली मीटिंग सिंक। स्वार्म ने विवरण तैयार कर लिया है और नोटिफिकेशन म्यूट कर दिए हैं।",
                "status": "done",
                "narration": "प्रिया, आपकी क्वेरी '{trunc_query}' के लिए क्लाइंट मीटिंग शेड्यूल हो चुकी है। कैलेंडर सुरक्षित कर दिया गया है!"
            },
            "coding": {
                "title": "गहन कोडिंग सत्र",
                "description": "कोडिंग और सिस्टम आर्किटेक्चर डिज़ाइन के लिए 2 घंटे का निर्बाध ब्लॉक।",
                "status": "done",
                "narration": "प्रिया, आपकी क्वेरी '{trunc_query}' के लिए कोडिंग सत्र आवंटित किया गया है। बिना किसी भटकाव के कोड पूरा करें!"
            },
            "study": {
                "title": "केंद्रित अध्ययन सत्र",
                "description": "शोध पत्रों और सिस्टम ऑप्टिमाइज़ेशन गाइड की समीक्षा। फोन डीएनडी पर सेट है।",
                "status": "done",
                "narration": "प्रिया, आपकी क्वेरी '{trunc_query}' के लिए सुबह का अध्ययन ब्लॉक तय किया गया है। मन लगाकर पढ़ें, स्वार्म ट्रैक करेगा!"
            },
            "travel": {
                "title": "यात्रा स्लॉट और आवागमन",
                "description": "गंतव्य तक यात्रा। स्वार्म ने मार्ग का सत्यापन किया, यातायात साफ लग रहा है।",
                "status": "done",
                "narration": "प्रिया, आपकी क्वेरी '{trunc_query}' के लिए यात्रा मार्ग अपडेट कर दिया गया है। आपकी यात्रा सुगम रहेगी!"
            }
        }
    },
    "hinglish": {
        "aliases": ["hinglish", "en-in", "mixed", "mixed-english-hindi"],
        "locale": "en-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Indian conversational female",
        "tone": "friendly and young",
        "energy": "medium-high",
        "formality": "casual",
        "fallback_narration": "Priya, aapki query '{trunc_query}' ke liye swarm plan ready hai! Sab tasks time pe set hain, tum bas follow karo, swarm handle karega!",
        "fallback_tasks": {
            "lunch": {
                "title": "Healthy lunch suggestion",
                "description": "Enjoy a fresh salad + high-protein meal near your location as recommended by swarm.",
                "narration": "Priya, aapki query '{trunc_query}' ke liye healthy lunch block update ke saath plan ready hai! Healthy food options set hain aur evening tasks line up ho gaye hain. Tum bas follow karo, swarm handle karega!"
            },
            "break": {
                "title": "30 min relaxation break",
                "description": "Swarm scheduled a 30-min break to recharge. Notifications muted.",
                "narration": "Priya, aapki query '{trunc_query}' ke liye breaks set ho chuki hain! Aaj stress free din rahega, buffer zones include kar diye hain. Tum bas follow karo, swarm handle karega!"
            },
            "meeting": {
                "title": "Important client meeting",
                "description": "High-priority meeting sync. Swarm has prepped details and muted background notifications.",
                "narration": "Priya, aapki query '{trunc_query}' ke liye client meeting schedule ho chuki hai. Calendar protect kar diya hai, ready raho!"
            },
            "coding": {
                "title": "Deep work coding session",
                "description": "2-hour uninterrupted block for coding and system architecture design.",
                "narration": "Priya, aapki query '{trunc_query}' ke liye deep work coding session allocate kiya hai. Bina kisi distraction ke code complete karo!"
            },
            "study": {
                "title": "Focused study session",
                "description": "Reviewing research papers and system optimization guides. Phone set to DND.",
                "narration": "Priya, aapki query '{trunc_query}' ke liye morning study block prioritize kiya hai. Go and study hard, swarm will track!"
            },
            "travel": {
                "title": "Travel slot & commute",
                "description": "Travel to destination. Swarm verified the route, traffic looks clear.",
                "narration": "Priya, aapki query '{trunc_query}' ke liye travel route update kar diya hai. Commute aur schedule smooth rahega!"
            }
        }
    },
    "tamil": {
        "aliases": ["tamil", "ta", "ta-in"],
        "locale": "ta-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    },
    "kannada": {
        "aliases": ["kannada", "kn", "kn-in"],
        "locale": "kn-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    },
    "telugu": {
        "aliases": ["telugu", "te", "te-in"],
        "locale": "te-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    },
    "malayalam": {
        "aliases": ["malayalam", "ml", "ml-in"],
        "locale": "ml-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    },
    "marathi": {
        "aliases": ["marathi", "mr", "mr-in"],
        "locale": "mr-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    },
    "gujarati": {
        "aliases": ["gujarati", "gu", "gu-in"],
        "locale": "gu-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    },
    "punjabi": {
        "aliases": ["punjabi", "pa", "pa-in"],
        "locale": "pa-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    },
    "bengali": {
        "aliases": ["bengali", "bn", "bn-in"],
        "locale": "bn-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Conversational female",
        "tone": "warm",
        "energy": "medium",
        "formality": "polite"
    }
}

# Expected agent IDs configuration
EXPECTED_AGENT_IDS = ["orchestrator", "personalization", "task-executor", "recommendation", "voice-narrator"]

# Optimized prompt instructing the model to generate ONLY the dynamic components
SYSTEM_PROMPT = """You are an AI swarm planning generator. Return ONLY JSON matching this format:
{
  "traces": {
    "orchestrator": "trace text (20-35 words)",
    "personalization": "trace text (20-35 words)",
    "task-executor": "trace text (20-35 words)",
    "recommendation": "trace text (20-35 words)",
    "voice-narrator": "trace text (20-35 words)"
  },
  "tasks": [
    {"time": "time string", "title": "task title", "description": "task details"}
  ],
  "voice_narration": "Natural, warm narration string",
  "language": "detected language: 'english', 'hindi', 'hinglish', 'tamil', 'kannada', 'telugu', 'malayalam', 'marathi', 'gujarati', 'punjabi', or 'bengali'",
  "language_confidence": 0.95
}
Generate 4-5 tasks. Traces must be 20-35 words. Return ONLY valid JSON, no explanations, no markdown wrappers.

### HALLUCINATION & NONSENSE PREVENTION:
- If the user query is gibberish, nonsense, single words with no context, or has no actionable task scheduling request (e.g., 'asdfgh', 'banana', 'rocket', 'guitar'), you MUST NOT fabricate a schedule. Instead, set "tasks" to an empty list [] and "voice_narration" to: "I couldn't understand what tasks you want me to schedule. Could you tell me what you'd like to plan?".

### HUMAN-FIRST CONVERSATIONAL NARRATION:
- Do NOT sound like a GPS reading time and task title strings literally. Guide and explain the schedule naturally like a warm companion (e.g., 'Let's start with your assignment in the morning when your focus is highest, then head to the gym...').

### LANGUAGE-SPECIFIC NARRATION STYLES:
- English: Warm, encouraging, conversational (e.g., 'Hey! I've planned your day so you don't feel overwhelmed...').
- Hindi: Polite, natural, conversational (e.g., 'नमस्ते! मैंने आपके पूरे दिन को संतुलित तरीके से व्यवस्थित किया है...').
- Hinglish: Casual, friendly, highly colloquial (e.g., 'Bro, maine tera pura din optimize kar diya hai. Sabse pehle assignment nipta lete hain...'). Do NOT sound like a direct translation.
- Other languages: Follow their native natural conversational flow.

### CONTEXT-AWARE PERSONALITY ADAPTATION:
- Analyze the user query context. If the user mentions stress, low sleep (e.g. slept 4 hours), excitement (e.g. hackathon), or feeling overwhelmed, naturally adjust your tone. Keep morning tasks lighter for sleep-deprived queries, and pace the schedule stress-free for overwhelmed queries. Maintain high energy and focus blocks for hackathon/excitement queries. Do not use fake empathy or dramatic wording.

### NATURAL HINGLISH NUMBER PRONUNCIATION:
- When writing in Hinglish, write numbers and times phonetically in Hindi words when it sounds natural (e.g. use "नौ बजे" instead of "9 baje", "साढ़े दस बजे" instead of "10:30 baje", "एक बजे" instead of "1 PM"). Do not force Hindi vocabulary everywhere, keep conversational flow natural.

### GREETING & CLOSING ROTATION:
- English: Rotate greetings ('Hey!', 'Good morning!', 'I've organized everything') and closings ('You've got this!', 'Just let me know if anything changes').
- Hindi: Rotate greetings ('नमस्ते!', 'आपका दिन तैयार है।') and closings ('शुभकामनाएँ।', 'अगर कोई बदलाव करना हो तो बताइएगा।').
- Hinglish: Rotate greetings ('Bro...', 'Chal...', 'Scene sorted hai.') and closings ('tension mat le, sab sorted hai', 'kuch change ho toh bata dena').
"""

RETRY_USER_PROMPT = "Return ONLY valid JSON. The 'voice_narration' must remain in the detected query language (English, Hindi, or Hinglish) without translating it or mixing languages. Preserve the same narration style and tone."

# Robust default mock response preserved and kept intact
DEFAULT_MOCK_RESPONSE = {
    "agents": [
        {
            "id": "orchestrator",
            "name": "Orchestrator",
            "workingStatus": "Splitting your request…",
            "doneStatus": "Request split into 4 life domains — work, energy, errands, family.",
            "trace": "Parsed user intent: client presentation @ 3 PM (high priority), low energy signal detected, grocery errand flagged, evening family call scheduled. Routing to Personalization Agent for profile context."
        },
        {
            "id": "personalization",
            "name": "Personalization Agent",
            "workingStatus": "Checking health + family profile…",
            "doneStatus": "Profile synced — energy dip pattern noted, mom call preference: evening.",
            "trace": "Health baseline: sleep 6.2h last night, HRV slightly low. Family profile: mom prefers calls after 6 PM. Priya's calendar shows back-to-back meetings until 2 PM. Adjusting plan for energy recovery before 3 PM presentation."
        },
        {
            "id": "task-executor",
            "name": "Task Executor Agent",
            "workingStatus": "Creating prioritized tasks…",
            "doneStatus": "5 tasks sequenced with time blocks and buffer zones.",
            "trace": "Task queue built: (1) Morning energy routine 8:00, (2) Grocery run 10:30, (3) Pre-presentation prep 2:30, (4) Client presentation 3:00, (5) Call mom 6:30. Added 15-min transitions between blocks."
        },
        {
            "id": "recommendation",
            "name": "Recommendation Agent",
            "workingStatus": "Suggesting energy booster…",
            "doneStatus": "Positioned energy booster — light walk + protein snack before presentation.",
            "trace": "Low energy mitigation: recommend 12-min walk at 2:15 PM + banana-almond snack at 2:25 PM. Avoid caffeine after 4 PM to protect evening sleep. Grocery trip timed during natural energy lull (10:30 AM)."
        },
        {
            "id": "voice-narrator",
            "name": "Voice Narrator Agent",
            "workingStatus": "Speaking in natural Hinglish…",
            "doneStatus": "Voice narration ready.",
            "trace": "Generated Hinglish narration for voice synthesis. Tone: warm, confident, concise. Mapped to text-to-speech engine. Output queued for fellow teammates."
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
    "voice_narration": "Priya, aaj ka plan ready hai! Subah energy boost se start, dopahar presentation ke liye prep aur snack, shaam ko groceries aur maa ko call — sab time pe set hai. Tum bas follow karo, swarm handle karega!",
    "voice_settings": {
        "language": "hinglish",
        "locale": "en-IN",
        "gender": "female",
        "style": "friendly",
        "speaking_rate": 1.0,
        "pitch": 1.0,
        "voice_personality": "Indian conversational female",
        "tone": "friendly and young",
        "energy": "medium-high",
        "formality": "casual"
    },
    "detected_language": {
        "language": "hinglish",
        "confidence": 1.0,
        "source": "fallback"
    }
}

# ==========================================
# DATA TYPING SCHEMAS (UNCHANGED FOR FRONTEND COMPATIBILITY)
# ==========================================
class SwarmRequest(BaseModel):
    query: str = Field(..., description="The user query to be processed by the swarm.")

class AgentSchema(BaseModel):
    id: str = Field(..., description="Unique ID for the agent matching React config.")
    name: str = Field(..., description="Human-readable name of the agent.")
    workingStatus: str = Field(..., description="Rigid string representing the working status.")
    doneStatus: str = Field(..., description="Rigid string representing the done/completed status.")
    trace: str = Field(..., description="The detailed system/thought trace of this agent.")

class TaskSchema(BaseModel):
    time: str = Field(..., description="String representing the scheduled time slot.")
    title: str = Field(..., description="Title of the task.")
    description: str = Field(..., description="Detailed description of the task.")
    status: str = Field(..., description="Must be 'done' or a precise status string.")

class DetectedLanguageSchema(BaseModel):
    language: str = Field(..., description="The detected language name")
    confidence: Optional[float] = Field(None, description="Detection confidence score (0.0 to 1.0)")
    source: str = Field(..., description="Source of detection, either 'llm' or 'fallback'")
    script: Optional[str] = Field(None, description="Optional script identifier")
    dialect: Optional[str] = Field(None, description="Optional dialect details")
    region: Optional[str] = Field(None, description="Optional regional details")
    translation_required: Optional[bool] = Field(None, description="Whether translation is needed")

class VoiceSettingsSchema(BaseModel):
    language: str = Field(..., description="Inferred language of the narration (e.g. english, hindi, hinglish)")
    locale: str = Field(..., description="Standard voice locale (e.g. en-US, hi-IN, en-IN)")
    gender: str = Field(..., description="Preferred voice gender, e.g. female")
    style: str = Field(..., description="Speaking style, e.g. friendly")
    speaking_rate: float = Field(..., description="Preferred speaking rate, e.g. 1.0")
    pitch: float = Field(..., description="Preferred pitch, e.g. 1.0")
    language_confidence: Optional[float] = Field(None, description="Optional language detection confidence score")
    voice_personality: Optional[str] = Field(None, description="Optional voice personality description")
    tone: Optional[str] = Field(None, description="Optional expressive speaking tone")
    energy: Optional[str] = Field(None, description="Optional expressive voice energy level")
    formality: Optional[str] = Field(None, description="Optional expressive voice formality level")

class SwarmResponse(BaseModel):
    agents: List[AgentSchema]
    tasks: List[TaskSchema]
    voice_narration: str
    voice_settings: VoiceSettingsSchema
    detected_language: DetectedLanguageSchema


# ==========================================
# CORE UTILITY & PARSING FUNCTIONS
# ==========================================


def find_json_objects(text: str) -> list:
    """Finds all potential JSON object substrings in text using a brace-matching state machine.
    Respects string literals, escapes, and nesting, avoiding corrupted parsing on text/brackets in strings.
    """
    candidates = []
    n = len(text)
    in_string = False
    escape = False
    brace_depth = 0
    start_idx = -1
    
    i = 0
    while i < n:
        char = text[i]
        
        if escape:
            escape = False
            i += 1
            continue
            
        if char == '\\':
            escape = True
            i += 1
            continue
            
        if char == '"':
            in_string = not in_string
            i += 1
            continue
            
        if not in_string:
            if char == '{':
                if brace_depth == 0:
                    start_idx = i
                brace_depth += 1
            elif char == '}':
                if brace_depth > 0:
                    brace_depth -= 1
                    if brace_depth == 0 and start_idx != -1:
                        candidate = text[start_idx : i + 1]
                        candidates.append(candidate)
        i += 1
        
    return candidates

def clean_json_string(raw_str: str) -> str:
    """Extracts and returns the best valid JSON object string from a raw string.
    Optimized: Quick path check for pre-formatted JSON to bypass the parsing state machine.
    """
    if not raw_str:
        return ""
        
    # Quick Path: Check if text is already a clean JSON object (common when format='json' is used)
    cleaned = raw_str.strip()
    if cleaned.startswith("{") and cleaned.endswith("}"):
        try:
            json.loads(cleaned)
            return cleaned
        except Exception:
            pass
            
    # Fallback to state machine for cleaning markdown wrappers and conversational noise
    candidates = find_json_objects(raw_str)
    valid_candidates = []
    for cand in candidates:
        try:
            parsed = json.loads(cand)
            if isinstance(parsed, dict):
                valid_candidates.append((cand, parsed))
        except Exception:
            continue
            
    if not valid_candidates:
        # Regex cleanup fallback
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = cleaned[start:end+1]
            try:
                json.loads(candidate)
                return candidate
            except Exception:
                pass
        return raw_str
        
    # Score candidates to select the actual response data block
    best_cand_str = None
    best_score = -1
    
    for cand_str, parsed_dict in valid_candidates:
        score = 0
        # Accepts either "traces" mapping or "agents" list format
        if "traces" in parsed_dict or "agents" in parsed_dict:
            score += 4
        if "tasks" in parsed_dict:
            score += 2
            if isinstance(parsed_dict["tasks"], list):
                score += min(len(parsed_dict["tasks"]), 5)
        if "voice_narration" in parsed_dict and isinstance(parsed_dict["voice_narration"], str) and parsed_dict["voice_narration"].strip():
            score += 5
            
        if score > best_score:
            best_score = score
            best_cand_str = cand_str
            
    return best_cand_str or valid_candidates[0][0]

def normalize_language(lang_str: str) -> str:
    """Normalize language value matching standard name variations or aliases to canonical names."""
    if not lang_str:
        return "english"
    cleaned = str(lang_str).strip().lower()
    for canonical_key, config in LANGUAGE_CONFIGS.items():
        if cleaned == canonical_key:
            return canonical_key
        aliases = config.get("aliases", [])
        if cleaned in [a.lower() for a in aliases]:
            return canonical_key
            
    # Substring matching fallback
    for canonical_key, config in LANGUAGE_CONFIGS.items():
        if canonical_key in cleaned:
            return canonical_key
        aliases = config.get("aliases", [])
        for alias in aliases:
            if alias.lower() in cleaned:
                return canonical_key
                
    return cleaned

def infer_language_from_text(text: str) -> str:
    """Helper to detect language based on character patterns and common words for fallback/repair."""
    if not text:
        return "english"
    # Devanagari Unicode block check for Hindi
    if re.search(r"[\u0900-\u097F]", text):
        return "hindi"
        
    lower_text = text.lower()
    
    # Common Hinglish indicators (colloquial words, mixed Hindi terms in Latin script)
    hinglish_keywords = [
        "kal", "aaj", "karna", "krna", "hai", "tha", "rahega", "hoga", "bana", "banao", 
        "yaar", "bro", "gym", "office", "khana", "jaana", "jana", "lena", "krdo", "kardo", 
        "hona", "chahiye", "ho", "gaya", "kya", "bhai", "sab", "toh", "ko", "se", "aur", "pe"
    ]
    
    words = re.findall(r"\b[a-z]+\b", lower_text)
    if not words:
        return "english"
        
    # Count how many words are common Hinglish/Hindi Romanized terms
    hinglish_word_count = sum(1 for w in words if w in hinglish_keywords)
    
    if hinglish_word_count > 0:
        return "hinglish"
        
    return "english"

def repair_and_build_response(data: dict) -> dict:
    """Repairs partial responses and constructs the final SwarmResponse structure.
    Saves token generation overhead by populating static agent profiles in python.
    """
    if not isinstance(data, dict):
        return None
        
    default_ref = DEFAULT_MOCK_RESPONSE
    
    # 1. Resolve voice narration
    voice_narration = data.get("voice_narration")
    if not isinstance(voice_narration, str) or not voice_narration.strip():
        voice_narration = default_ref["voice_narration"]
        
    # 2. Resolve language detection
    raw_lang = data.get("language")
    if not raw_lang and isinstance(data.get("voice_settings"), dict):
        raw_lang = data["voice_settings"].get("language")
    if not raw_lang:
        raw_lang = data.get("detected_language")
        
    source = "llm"
    confidence = data.get("language_confidence")
    if confidence is not None:
        try:
            confidence = float(confidence)
        except ValueError:
            confidence = None
            
    if not isinstance(raw_lang, str) or not raw_lang.strip():
        raw_lang = infer_language_from_text(voice_narration)
        source = "fallback"
        confidence = None  # Reset confidence for heuristics detection
        
    # Normalize language name using aliases
    lang = normalize_language(raw_lang)
    
    # Configure lookup and warn on unknown languages
    config = LANGUAGE_CONFIGS.get(lang)
    if not config:
        logger.warning(f"Unknown language detected: {lang}")
        lang = "english"  # Default to English
        config = LANGUAGE_CONFIGS[lang]
        
    # 3. Resolve tasks & clarification status
    tasks_list = []
    gen_tasks = data.get("tasks")
    is_clarification = False
    if isinstance(gen_tasks, list) and len(gen_tasks) == 0:
        is_clarification = True
        
    if isinstance(gen_tasks, list) and gen_tasks:
        for idx, task in enumerate(gen_tasks):
            if not isinstance(task, dict):
                ref_task = default_ref["tasks"][idx % len(default_ref["tasks"])]
                tasks_list.append(copy.deepcopy(ref_task))
                continue
            tasks_list.append({
                "time": str(task.get("time") or "N/A"),
                "title": str(task.get("title") or "Task"),
                "description": str(task.get("description") or "Details not provided."),
                "status": "done"  # Rigidly enforce "done"
            })
    elif is_clarification:
        tasks_list = []
    else:
        tasks_list = copy.deepcopy(default_ref["tasks"])
        
    # 4. Resolve traces (supports both traces dict and agents list formats)
    traces = {}
    gen_traces = data.get("traces")
    if isinstance(gen_traces, dict):
        for k, v in gen_traces.items():
            if isinstance(v, str) and v.strip():
                traces[k] = v.strip()
    
    # Fallback to check if model returned agents list instead of traces dict
    gen_agents = data.get("agents")
    if isinstance(gen_agents, list):
        for a in gen_agents:
            if isinstance(a, dict) and "id" in a and "trace" in a:
                if isinstance(a["trace"], str) and a["trace"].strip():
                    traces[a["id"]] = a["trace"].strip()
                    
    # Build the final 5 agents list
    agents_list = []
    capitalized_lang = lang.capitalize()
    for default_agent in default_ref["agents"]:
        aid = default_agent["id"]
        trace_val = traces.get(aid) or default_agent["trace"]
        working_status = default_agent["workingStatus"]
        done_status = default_agent["doneStatus"]
        
        if aid == "voice-narrator":
            if is_clarification:
                working_status = "Awaiting clarification..."
                done_status = "Awaiting user input."
            else:
                working_status = f"Speaking in natural {capitalized_lang}..."
                done_status = "Voice narration ready."
            
        agents_list.append({
            "id": aid,
            "name": default_agent["name"],
            "workingStatus": working_status,
            "doneStatus": done_status,
            "trace": trace_val
        })
        
    # Validation safeguard: verify all voice settings defaults exist, rebuilding from English config if missing
    default_config = LANGUAGE_CONFIGS["english"]
    locale_val = config.get("locale") or default_config["locale"]
    gender_val = config.get("gender") or default_config["gender"]
    style_val = config.get("style") or default_config["style"]
    
    speaking_rate_val = config.get("speaking_rate")
    if speaking_rate_val is None:
        speaking_rate_val = default_config["speaking_rate"]
        
    pitch_val = config.get("pitch")
    if pitch_val is None:
        pitch_val = default_config["pitch"]
        
    # Extract expressive voice settings from configuration
    voice_personality_val = config.get("voice_personality")
    tone_val = config.get("tone")
    energy_val = config.get("energy")
    formality_val = config.get("formality")
        
    # Construct complete voice_settings & detected_language schemas
    voice_settings_dict = {
        "language": lang,
        "locale": locale_val,
        "gender": gender_val,
        "style": style_val,
        "speaking_rate": speaking_rate_val,
        "pitch": pitch_val
    }
    if confidence is not None:
        voice_settings_dict["language_confidence"] = confidence
    if voice_personality_val:
        voice_settings_dict["voice_personality"] = voice_personality_val
    if tone_val:
        voice_settings_dict["tone"] = tone_val
    if energy_val:
        voice_settings_dict["energy"] = energy_val
    if formality_val:
        voice_settings_dict["formality"] = formality_val
        
    detected_language_dict = {
        "language": lang,
        "confidence": confidence,
        "source": source
    }
    
    # Trace log containing all required parameters
    logger.info(
        f"Language Detection Trace - Detected: {raw_lang}, Normalized: {lang}, "
        f"Source: {source}, Confidence: {confidence}, Heuristics Fallback: {'yes' if source == 'fallback' else 'no'}, "
        f"Locale: {locale_val}"
    )
        
    return {
        "agents": agents_list,
        "tasks": tasks_list,
        "voice_narration": voice_narration,
        "voice_settings": voice_settings_dict,
        "detected_language": detected_language_dict
    }

def verbose_validate_and_repair(raw_content: str, attempt_num: int) -> dict:
    """Logs raw output, parses it, records JSON parse and validation durations, and repairs the schema.
    """
    logger.info(f"--- [Attempt {attempt_num}] Validation & Parsing Trace ---")
    logger.info(f"COMPLETE raw Gemini response:\n{raw_content}")
    
    cleaned = clean_json_string(raw_content)
    logger.info(f"Cleaned JSON substring:\n{cleaned}")
    
    # Try parsing JSON
    parse_start = time.perf_counter()
    try:
        data = json.loads(cleaned)
        json_parse_time = (time.perf_counter() - parse_start) * 1000
        logger.info(f"JSON parsing time: {json_parse_time:.2f} ms")
    except Exception as e:
        json_parse_time = (time.perf_counter() - parse_start) * 1000
        logger.error(f"JSON parsing failed after {json_parse_time:.2f} ms!")
        tb_str = "".join(traceback.format_exception(None, e, e.__traceback__))
        logger.error(f"Traceback:\n{tb_str}")
        return None
        
    # Repair and build response
    val_start = time.perf_counter()
    repaired = repair_and_build_response(data)
    val_time = (time.perf_counter() - val_start) * 1000
    logger.info(f"Validation & Repair time: {val_time:.2f} ms")
    
    return repaired

def get_fallback_response(query: str) -> dict:
    """Dynamic configuration-driven fallback system supporting custom query keywords."""
    fallback = copy.deepcopy(DEFAULT_MOCK_RESPONSE)
    lower_query = query.lower()
    
    # Inferred language and config lookup
    detected_lang = infer_language_from_text(query)
    normalized_lang = normalize_language(detected_lang)
    config = LANGUAGE_CONFIGS.get(normalized_lang, LANGUAGE_CONFIGS["english"])
    
    # Assign fallback metadata
    fallback["detected_language"] = {
        "language": normalized_lang,
        "confidence": None,
        "source": "fallback"
    }
    fallback["voice_settings"] = {
        "language": normalized_lang,
        "locale": config["locale"],
        "gender": config["gender"],
        "style": config["style"],
        "speaking_rate": config["speaking_rate"],
        "pitch": config["pitch"]
    }
    
    # Dynamically update the Voice Narrator agent status in the fallback agents list
    capitalized_lang = normalized_lang.capitalize()
    for agent in fallback["agents"]:
        if agent["id"] == "voice-narrator":
            agent["workingStatus"] = f"Speaking in natural {capitalized_lang}..."
            agent["doneStatus"] = "Voice narration ready."
            
    # Truncate user query
    trunc_query = query if len(query) <= 50 else query[:47] + "..."
    
    # Populate localized narration from config
    narr_template = config.get("fallback_narration") or LANGUAGE_CONFIGS["english"]["fallback_narration"]
    fallback["voice_narration"] = narr_template.format(trunc_query=trunc_query)
    
    # Dynamic keyword task updates from config
    fallback_tasks = config.get("fallback_tasks") or LANGUAGE_CONFIGS["english"]["fallback_tasks"]
    
    # Map query keywords to config tasks
    keyword_mapping = {
        "lunch": ["lunch", "eat", "food", "खाना", "लंच"],
        "break": ["break", "relax", "आराम", "ब्रेक"],
        "meeting": ["meeting", "मीटिंग"],
        "coding": ["coding", "कोडिंग"],
        "study": ["study", "पढ़ना", "पढ़ाई"],
        "travel": ["travel", "यात्रा", "घूमना"]
    }
    
    # Run matching
    matched_key = None
    for key, keywords in keyword_mapping.items():
        if any(k in lower_query for k in keywords):
            matched_key = key
            break
            
    if matched_key and matched_key in fallback_tasks:
        task_data = fallback_tasks[matched_key]
        idx_map = {"lunch": 1, "break": 2, "meeting": 3, "coding": 2, "study": 0, "travel": 1}
        target_idx = idx_map.get(matched_key, 1)
        
        fallback["tasks"][target_idx] = {
            "time": fallback["tasks"][target_idx]["time"],
            "title": task_data["title"],
            "description": task_data["description"],
            "status": "done"
        }
        fallback["voice_narration"] = task_data["narration"].format(trunc_query=trunc_query)
        
    logger.info(
        f"Language Detection Trace (Fallback) - Detected: {detected_lang}, Normalized: {normalized_lang}, "
        f"Source: fallback, Confidence: None, Heuristics Fallback: yes, Locale: {config['locale']}"
    )
        
    return fallback


# ==========================================
# SWARM API ENDPOINT WITH TIMING METRICS
# ==========================================
@app.post("/api/swarm", response_model=SwarmResponse)
async def process_swarm_query(request: SwarmRequest):
    req_start = time.perf_counter()
    query = request.query.strip()
    logger.info(f"Incoming query: {query}")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    logger.info("Generation started")
    
    raw_content_1 = ""
    try:
        # First attempt with Gemini 2.5 Flash
        inf_start = time.perf_counter()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=query,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json"
            )
        )
        inf_time = (time.perf_counter() - inf_start) * 1000
        logger.info(f"Gemini inference latency: {inf_time:.2f} ms")
        
        raw_content_1 = response.text or ""
        logger.info(f"Total characters received: {len(raw_content_1)}")
        if hasattr(response, "usage_metadata") and response.usage_metadata:
            prompt_tokens = getattr(response.usage_metadata, "prompt_token_count", None)
            completion_tokens = getattr(response.usage_metadata, "candidates_token_count", None)
            total_tokens = getattr(response.usage_metadata, "total_token_count", None)
            if prompt_tokens is not None:
                logger.info(f"Prompt tokens: {prompt_tokens}")
            if completion_tokens is not None:
                logger.info(f"Completion tokens: {completion_tokens}")
            if total_tokens is not None:
                logger.info(f"Total tokens: {total_tokens}")
            
        repaired_json = verbose_validate_and_repair(raw_content_1, attempt_num=1)
        
        if repaired_json:
            total_time = (time.perf_counter() - req_start) * 1000
            logger.info(f"Incoming query: {query}")
            logger.info(f"Detected language: {repaired_json['detected_language']['language']}")
            logger.info(f"Normalized language: {repaired_json['detected_language']['language']}")
            logger.info(f"Locale: {repaired_json['voice_settings']['locale']}")
            logger.info(f"Constructed detected_language object: {repaired_json['detected_language']}")
            logger.info(f"Constructed voice_settings object: {repaired_json['voice_settings']}")
            logger.info(f"Final response JSON immediately before returning from /api/swarm: {json.dumps(repaired_json, ensure_ascii=False)}")
            logger.info("HTTP status code: 200")
            logger.info(f"Generation completed. Total request time: {total_time:.2f} ms")
            return repaired_json
            
        # First attempt failed validation or parsing: execute retry flow
        logger.warning("Retry")
        
        # Determine language detected in the first turn to preserve it in retry
        first_lang = "english"
        try:
            parsed_first = json.loads(clean_json_string(raw_content_1))
            first_lang = parsed_first.get("language") or parsed_first.get("detected_language", {}).get("language")
        except Exception:
            pass
        if not first_lang:
            first_lang = infer_language_from_text(raw_content_1)
        normalized_first = normalize_language(first_lang)
        
        # Build dynamic retry prompt that preserves detected language and tone
        dynamic_retry_prompt = f"Return ONLY valid JSON. The 'voice_narration' MUST be generated entirely and naturally in {normalized_first}. Do NOT translate it or mix languages. Preserve the same narration style and tone."
        
        inf_start_retry = time.perf_counter()
        retry_response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[query, dynamic_retry_prompt],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                response_mime_type="application/json"
            )
        )
        inf_time_retry = (time.perf_counter() - inf_start_retry) * 1000
        logger.info(f"Gemini inference latency (retry): {inf_time_retry:.2f} ms")
        
        raw_content_2 = retry_response.text or ""
        logger.info(f"Total characters received (retry): {len(raw_content_2)}")
        if hasattr(retry_response, "usage_metadata") and retry_response.usage_metadata:
            prompt_tokens = getattr(retry_response.usage_metadata, "prompt_token_count", None)
            completion_tokens = getattr(retry_response.usage_metadata, "candidates_token_count", None)
            total_tokens = getattr(retry_response.usage_metadata, "total_token_count", None)
            if prompt_tokens is not None:
                logger.info(f"Prompt tokens (retry): {prompt_tokens}")
            if completion_tokens is not None:
                logger.info(f"Completion tokens (retry): {completion_tokens}")
            if total_tokens is not None:
                logger.info(f"Total tokens (retry): {total_tokens}")
            
        repaired_json_retry = verbose_validate_and_repair(raw_content_2, attempt_num=2)
        
        if repaired_json_retry:
            total_time = (time.perf_counter() - req_start) * 1000
            logger.info(f"Incoming query: {query}")
            logger.info(f"Detected language: {repaired_json_retry['detected_language']['language']}")
            logger.info(f"Normalized language: {repaired_json_retry['detected_language']['language']}")
            logger.info(f"Locale: {repaired_json_retry['voice_settings']['locale']}")
            logger.info(f"Constructed detected_language object: {repaired_json_retry['detected_language']}")
            logger.info(f"Constructed voice_settings object: {repaired_json_retry['voice_settings']}")
            logger.info(f"Final response JSON immediately before returning from /api/swarm: {json.dumps(repaired_json_retry, ensure_ascii=False)}")
            logger.info("HTTP status code: 200")
            logger.info(f"Generation completed. Total request time: {total_time:.2f} ms")
            return repaired_json_retry
            
        logger.warning("Fallback used: Both generation attempts failed validation or parsing.")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        logger.error(traceback.format_exc())
        logger.warning("Fallback used: Exception raised during Gemini API request execution.")
        
    total_time = (time.perf_counter() - req_start) * 1000
    fallback_res = get_fallback_response(query)
    logger.info(f"Incoming query: {query}")
    logger.info(f"Detected language: {fallback_res['detected_language']['language']}")
    logger.info(f"Normalized language: {fallback_res['detected_language']['language']}")
    logger.info(f"Locale: {fallback_res['voice_settings']['locale']}")
    logger.info(f"Constructed detected_language object: {fallback_res['detected_language']}")
    logger.info(f"Constructed voice_settings object: {fallback_res['voice_settings']}")
    logger.info(f"Final response JSON immediately before returning from /api/swarm: {json.dumps(fallback_res, ensure_ascii=False)}")
    logger.info("HTTP status code: 200")
    logger.info(f"Request completed via fallback. Total request time: {total_time:.2f} ms")
    return fallback_res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
