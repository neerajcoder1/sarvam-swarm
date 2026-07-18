import json
import logging
import re
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import ollama

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("swarm_backend")

app = FastAPI(title="Sarvam Swarm Backend", version="1.0.0")

# 1. WIDE-OPEN CORS MIDDLEWARE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. RIGID DATA TYPING FOR SCHEMAS
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

# Robust default mock data matching the frontend's original schema
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
            "doneStatus": "Energy boosters added — light walk + protein snack before presentation.",
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

def clean_json_string(raw_str: str) -> str:
    """Defensively cleans local model outputs of markdown wrappers, trailing text, etc."""
    cleaned = raw_str.strip()
    # Strip markdown code block fences if they exist
    if cleaned.startswith("```"):
        # Match ```json ... ``` or just ``` ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()
    return cleaned

@app.post("/api/swarm", response_model=SwarmResponse)
async def process_swarm_query(request: SwarmRequest):
    query = request.query.strip()
    logger.info(f"Received swarm query: {query}")

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    system_prompt = (
        "You are the orchestrator and simulation engine for a 5-agent life assistant swarm. "
        "Your task is to analyze the user's query and simulate the interactions of 5 autonomous agents:\n"
        "1. Orchestrator: Analyzes user query, detects key domains (work, wellness, family, tasks).\n"
        "2. Personalization Agent: Tailors traces to user's daily habits, health markers, and preferences.\n"
        "3. Task Executor Agent: Sequences concrete time-blocked tasks to achieve goals.\n"
        "4. Recommendation Agent: Injects smart recommendations (nutrition, energy, breaks, location advice).\n"
        "5. Voice Narrator Agent: Drafts a warm Hinglish summary of the day.\n\n"
        "You must respond with a SINGLE valid JSON object. Do not output any notes, markdown markers outside the JSON, or chat preamble. "
        "Strictly adhere to the following schema:\n"
        "{\n"
        '  "agents": [\n'
        "    {\n"
        '      "id": "orchestrator",\n'
        '      "name": "Orchestrator",\n'
        '      "workingStatus": "Splitting your request…",\n'
        '      "doneStatus": "<string summarizing what the orchestrator split/organized>",\n'
        '      "trace": "<detailed system log text summarizing the input analysis>"\n'
        "    },\n"
        "    {\n"
        '      "id": "personalization",\n'
        '      "name": "Personalization Agent",\n'
        '      "workingStatus": "Checking health + family profile…",\n'
        '      "doneStatus": "<string summarizing personalization findings>",\n'
        '      "trace": "<detailed personalization adjustments based on health, context, or profiles>"\n'
        "    },\n"
        "    {\n"
        '      "id": "task-executor",\n'
        '      "name": "Task Executor Agent",\n'
        '      "workingStatus": "Creating prioritized tasks…",\n'
        '      "doneStatus": "<string summarizing tasks sequenced>",\n'
        '      "trace": "<detailed timeline reasoning log showing how tasks were prioritised and sequenced>"\n'
        "    },\n"
        "    {\n"
        '      "id": "recommendation",\n'
        '      "name": "Recommendation Agent",\n'
        '      "workingStatus": "Suggesting energy booster…",\n'
        '      "doneStatus": "<string summarizing recommendations added>",\n'
        '      "trace": "<detailed recommendation details (e.g. food, specific physical activities, timing)>"\n'
        "    },\n"
        "    {\n"
        '      "id": "voice-narrator",\n'
        '      "name": "Voice Narrator Agent",\n'
        '      "workingStatus": "Speaking in natural Hinglish…",\n'
        '      "doneStatus": "Day plan narrated — ready for Sarvam Samvaad voice output.",\n'
        '      "trace": "<voice narration trace confirming the Hinglish format and TTS pipeline status>"\n'
        "    }\n"
        "  ],\n"
        '  "tasks": [\n'
        "    {\n"
        '      "time": "<formatted time string, e.g. 9:00 AM>",\n'
        '      "title": "<short task name>",\n'
        '      "description": "<detailed action description adapted to the query>",\n'
        '      "status": "done"\n'
        "    }\n"
        "  ],\n"
        '  "voice_narration": "<friendly Hinglish audio narration summary script starting with Priya, e.g. \'Priya, aaj ka plan ready hai!...\'>"\n'
        "}\n\n"
        "Ensure all fields are filled dynamically according to the user's input request: "
        f"'{query}'"
    )

    try:
        # Request generation from local Ollama service using Llama3
        logger.info("Attempting local Ollama generation using llama3...")
        response = ollama.chat(
            model="llama3",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate the swarm output JSON for: '{query}'"}
            ],
            options={"temperature": 0.2}
        )
        
        raw_content = response['message']['content']
        cleaned_content = clean_json_string(raw_content)
        parsed_json = json.loads(cleaned_content)
        
        # Verify basic structure to avoid Pydantic validation errors
        if "agents" in parsed_json and "tasks" in parsed_json and "voice_narration" in parsed_json:
            # Enforce exactly 5 agents in correct order
            agent_ids = [a["id"] for a in parsed_json["agents"]]
            expected_ids = ["orchestrator", "personalization", "task-executor", "recommendation", "voice-narrator"]
            if len(parsed_json["agents"]) == 5 and all(eid in agent_ids for eid in expected_ids):
                logger.info("Ollama generated successfully and schema validation passed.")
                return parsed_json
            else:
                logger.warning("Ollama did not return the 5 expected agent IDs. Falling back.")
        else:
            logger.warning("Ollama output missing top-level keys. Falling back.")

    except Exception as e:
        logger.error(f"Failed to generate or parse response from Ollama: {str(e)}")

    # 4. BULLETPROOF TRY-EXCEPT FALLBACK
    logger.info("Using robust default mock fallback data.")
    
    # We can perform simple dynamic adjustments to the fallback data to make it feel responsive even in fallback mode!
    fallback = dict(DEFAULT_MOCK_RESPONSE)
    
    # Simple keyword heuristics to adapt fallback details slightly if keywords match
    lower_query = query.lower()
    if "lunch" in lower_query or "eat" in lower_query or "food" in lower_query:
        fallback["tasks"][1] = {
            "time": "1:00 PM",
            "title": "Healthy lunch suggestion",
            "description": "Enjoy a fresh salad + high-protein meal near your location as recommended by swarm.",
            "status": "done"
        }
        fallback["voice_narration"] = "Priya, lunch block update ke saath plan ready hai! Healthy food options set hain, aur evening tasks line up ho gaye hain. Tum bas follow karo, swarm handle karega!"
    elif "break" in lower_query or "relax" in lower_query:
        fallback["tasks"][2] = {
            "time": "4:30 PM",
            "title": "30 min relaxation break",
            "description": "Swarm scheduled a 30-min break to recharge. Notifications muted.",
            "status": "done"
        }
        fallback["voice_narration"] = "Priya, breaks set ho chuki hain! Aaj stress free din rahega, buffer zones include kar diye hain. Tum bas follow karo, swarm handle karega!"
        
    return fallback

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
