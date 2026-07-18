import json
import logging
import re
import copy
import traceback
import time
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import ollama

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
# Configurable model. For maximum speed, 'llama3.2:3b' or 'qwen2.5:3b' are highly recommended.
MODEL_NAME = "gemma3:4b"

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
  "voice_narration": "Hinglish narration string"
}
Generate 4-5 tasks. Traces must be 20-35 words. Return ONLY valid JSON, no explanations, no markdown wrappers."""

RETRY_USER_PROMPT = "Return ONLY valid JSON. No markdown. No explanations."

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
            "doneStatus": "Day plan narrated — ready for Sarvam Samvaad voice output.",
            "trace": "Generated Hinglish narration for voice synthesis. Tone: warm, confident, concise. Mapped to Sarvam Samvaad TTS pipeline. Output queued for fellow teammates."
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
    "voice_narration": "Priya, aaj ka plan ready hai! Subah energy boost se start, dopahar presentation ke liye prep aur snack, shaam ko groceries aur maa ko call — sab time pe set hai. Tum bas follow karo, swarm handle karega!"
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

class SwarmResponse(BaseModel):
    agents: List[AgentSchema]
    tasks: List[TaskSchema]
    voice_narration: str


# ==========================================
# CORE UTILITY & PARSING FUNCTIONS
# ==========================================
_MODEL_NAME_CACHE = None

def get_model_name() -> str:
    """Discovers available models from Ollama, caching the result. Defaults to global MODEL_NAME."""
    global _MODEL_NAME_CACHE
    if _MODEL_NAME_CACHE is not None:
        return _MODEL_NAME_CACHE
        
    try:
        response = ollama.list()
        models = []
        if isinstance(response, dict):
            models = response.get("models", [])
        elif isinstance(response, list):
            models = response
            
        available_names = []
        for m in models:
            if isinstance(m, dict):
                name = m.get("model") or m.get("name")
                if name:
                    available_names.append(name)
            elif hasattr(m, "model"):
                available_names.append(m.model)
            elif hasattr(m, "name"):
                available_names.append(m.name)
                
        if available_names:
            if MODEL_NAME in available_names:
                _MODEL_NAME_CACHE = MODEL_NAME
                return MODEL_NAME
            base_default = MODEL_NAME.split(":")[0]
            for name in available_names:
                if name.startswith(base_default):
                    _MODEL_NAME_CACHE = name
                    return name
            _MODEL_NAME_CACHE = available_names[0]
            return _MODEL_NAME_CACHE
    except Exception:
        pass
    _MODEL_NAME_CACHE = MODEL_NAME
    return MODEL_NAME

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

def repair_and_build_response(data: dict) -> dict:
    """Repairs partial responses and constructs the final SwarmResponse structure.
    Saves token generation overhead by populating static agent profiles in python.
    """
    if not isinstance(data, dict):
        return None
        
    default_ref = DEFAULT_MOCK_RESPONSE
    
    # 1. Resolve traces (supports both traces dict and agents list formats)
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
    for default_agent in default_ref["agents"]:
        aid = default_agent["id"]
        trace_val = traces.get(aid) or default_agent["trace"]
        agents_list.append({
            "id": aid,
            "name": default_agent["name"],
            "workingStatus": default_agent["workingStatus"],
            "doneStatus": default_agent["doneStatus"],
            "trace": trace_val
        })
        
    # 2. Resolve tasks
    tasks_list = []
    gen_tasks = data.get("tasks")
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
    else:
        tasks_list = copy.deepcopy(default_ref["tasks"])
        
    # 3. Resolve voice narration
    voice_narration = data.get("voice_narration")
    if not isinstance(voice_narration, str) or not voice_narration.strip():
        voice_narration = default_ref["voice_narration"]
        
    return {
        "agents": agents_list,
        "tasks": tasks_list,
        "voice_narration": voice_narration
    }

def verbose_validate_and_repair(raw_content: str, attempt_num: int) -> dict:
    """Logs raw output, parses it, records JSON parse and validation durations, and repairs the schema.
    """
    logger.info(f"--- [Attempt {attempt_num}] Validation & Parsing Trace ---")
    logger.info(f"COMPLETE raw Ollama response:\n{raw_content}")
    
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
    """Dynamic fallback system supporting custom query keywords and referencing query."""
    fallback = copy.deepcopy(DEFAULT_MOCK_RESPONSE)
    lower_query = query.lower()
    
    # Truncate user query for clean voice narration reference
    trunc_query = query if len(query) <= 50 else query[:47] + "..."
    fallback["voice_narration"] = f"Priya, aapki query '{trunc_query}' ke liye swarm plan ready hai! Sab tasks time pe set hain, tum bas follow karo, swarm handle karega!"
    
    if any(k in lower_query for k in ["lunch", "eat", "food"]):
        fallback["tasks"][1] = {
            "time": "1:00 PM",
            "title": "Healthy lunch suggestion",
            "description": "Enjoy a fresh salad + high-protein meal near your location as recommended by swarm.",
            "status": "done"
        }
        fallback["voice_narration"] = f"Priya, aapki query '{trunc_query}' ke liye healthy lunch block update ke saath plan ready hai! Healthy food options set hain aur evening tasks line up ho gaye hain. Tum bas follow karo, swarm handle karega!"
        
    elif any(k in lower_query for k in ["break", "relax"]):
        fallback["tasks"][2] = {
            "time": "4:30 PM",
            "title": "30 min relaxation break",
            "description": "Swarm scheduled a 30-min break to recharge. Notifications muted.",
            "status": "done"
        }
        fallback["voice_narration"] = f"Priya, aapki query '{trunc_query}' ke liye breaks set ho chuki hain! Aaj stress free din rahega, buffer zones include kar diye hain. Tum bas follow karo, swarm handle karega!"
        
    elif "meeting" in lower_query:
        fallback["tasks"][3] = {
            "time": "3:00 PM",
            "title": "Important client meeting",
            "description": "High-priority meeting sync. Swarm has prepped details and muted background notifications.",
            "status": "done"
        }
        fallback["voice_narration"] = f"Priya, aapki query '{trunc_query}' ke liye client meeting schedule ho chuki hai. Calendar protect kar diya hai, ready raho!"
        
    elif "coding" in lower_query:
        fallback["tasks"][2] = {
            "time": "2:00 PM",
            "title": "Deep work coding session",
            "description": "2-hour uninterrupted block for coding and system architecture design.",
            "status": "done"
        }
        fallback["voice_narration"] = f"Priya, aapki query '{trunc_query}' ke liye deep work coding session allocate kiya hai. Bina kisi distraction ke code complete karo!"
        
    elif "study" in lower_query:
        fallback["tasks"][0] = {
            "time": "9:00 AM",
            "title": "Focused study session",
            "description": "Reviewing research papers and system optimization guides. Phone set to DND.",
            "status": "done"
        }
        fallback["voice_narration"] = f"Priya, aapki query '{trunc_query}' ke liye morning study block prioritize kiya hai. Go and study hard, swarm will track!"
        
    elif "travel" in lower_query:
        fallback["tasks"][1] = {
            "time": "11:00 AM",
            "title": "Travel slot & commute",
            "description": "Travel to destination. Swarm verified the route, traffic looks clear.",
            "status": "done"
        }
        fallback["voice_narration"] = f"Priya, aapki query '{trunc_query}' ke liye travel route update kar diya hai. Commute aur schedule smooth rahega!"
        
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
        
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": query}
    ]
    
    model_name = get_model_name()
    logger.info("Generation started")
    
    raw_content_1 = ""
    try:
        # First attempt (uses format="json" to force JSON generation inside Ollama for speed & precision)
        # Increased num_predict to 1000 to prevent premature truncation of the generated JSON object
        inf_start = time.perf_counter()
        response = ollama.chat(
            model=model_name,
            messages=messages,
            format="json",
            stream=False,
            keep_alive="30m",
            options={
                "temperature": 0.1,
                "num_predict": 1000,  # Safe token generation budget preventing truncation
                "top_p": 0.9,
                "top_k": 40
            }
        )
        inf_time = (time.perf_counter() - inf_start) * 1000
        logger.info(f"Ollama inference time: {inf_time:.2f} ms")
        
        # Telemetry extraction and logging
        raw_content_1 = response.get('message', {}).get('content', '')
        done = response.get('done', True)
        done_reason = response.get('done_reason', '')
        eval_count = response.get('eval_count', 0)
        
        logger.info(f"Total characters received: {len(raw_content_1)}")
        logger.info(f"Total tokens generated: {eval_count}")
        logger.info(f"Generation ended normally: {done and done_reason == 'stop'}")
        logger.info(f"Generation was truncated: {done_reason == 'limit'}")
        if done_reason == 'limit':
            logger.warning(f"Warning: First generation attempt truncated. Reason: limit (num_predict limit of 1000 reached)")
            
        repaired_json = verbose_validate_and_repair(raw_content_1, attempt_num=1)
        
        if repaired_json:
            total_time = (time.perf_counter() - req_start) * 1000
            logger.info(f"Generation completed. Total request time: {total_time:.2f} ms")
            return repaired_json
            
        # First attempt failed validation or parsing: execute retry flow
        logger.warning("Retry")
        retry_messages = messages + [
            {"role": "assistant", "content": raw_content_1},
            {"role": "user", "content": RETRY_USER_PROMPT}
        ]
        
        inf_start_retry = time.perf_counter()
        retry_response = ollama.chat(
            model=model_name,
            messages=retry_messages,
            format="json",
            stream=False,
            keep_alive="30m",
            options={
                "temperature": 0.1,
                "num_predict": 1000,  # Safe token generation budget preventing truncation
                "top_p": 0.9,
                "top_k": 40
            }
        )
        inf_time_retry = (time.perf_counter() - inf_start_retry) * 1000
        logger.info(f"Ollama inference time (retry): {inf_time_retry:.2f} ms")
        
        raw_content_2 = retry_response.get('message', {}).get('content', '')
        done_retry = retry_response.get('done', True)
        done_reason_retry = retry_response.get('done_reason', '')
        eval_count_retry = retry_response.get('eval_count', 0)
        
        logger.info(f"Total characters received (retry): {len(raw_content_2)}")
        logger.info(f"Total tokens generated (retry): {eval_count_retry}")
        logger.info(f"Generation ended normally (retry): {done_retry and done_reason_retry == 'stop'}")
        logger.info(f"Generation was truncated (retry): {done_reason_retry == 'limit'}")
        if done_reason_retry == 'limit':
            logger.warning(f"Warning: Retry generation attempt truncated. Reason: limit (num_predict limit of 1000 reached)")
            
        repaired_json_retry = verbose_validate_and_repair(raw_content_2, attempt_num=2)
        
        if repaired_json_retry:
            total_time = (time.perf_counter() - req_start) * 1000
            logger.info(f"Generation completed. Total request time: {total_time:.2f} ms")
            return repaired_json_retry
            
        logger.warning("Fallback used: Both generation attempts failed validation or parsing.")
        
    except Exception as e:
        logger.error(f"Error: {e}")
        logger.error(traceback.format_exc())
        logger.warning("Fallback used: Exception raised during Ollama API request execution.")
        
    total_time = (time.perf_counter() - req_start) * 1000
    logger.info(f"Request completed via fallback. Total request time: {total_time:.2f} ms")
    return get_fallback_response(query)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
