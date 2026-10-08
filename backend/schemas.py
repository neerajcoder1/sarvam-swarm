from pydantic import BaseModel, Field
from typing import List, Optional

class VoiceSettingsSchema(BaseModel):
    language: str = Field(..., description="The language code (e.g. english, hindi).")
    locale: str = Field(..., description="The locale string (e.g. en-US, hi-IN).")
    gender: str = Field(..., description="The preferred voice gender.")
    style: str = Field(..., description="The speaking style/tone.")
    speaking_rate: float = Field(..., description="Speaking rate multiplier.")
    pitch: float = Field(..., description="Pitch multiplier.")

class DetectedLanguageSchema(BaseModel):
    language: str = Field(..., description="The normalized language name.")
    confidence: Optional[float] = Field(None, description="Confidence score of language detection.")
    source: str = Field(..., description="Where the language detection came from.")

class SwarmRequest(BaseModel):
    query: str = Field(..., description="The user query to be processed by the swarm.")

class TTSRequest(BaseModel):
    text: str = Field(..., description="The text to convert to speech.")
    language: str = Field(default="english", description="The language of the text.")

class AgentSchema(BaseModel):
    id: str = Field(..., description="Unique ID for the agent matching React config.")
    name: str = Field(..., description="Human-readable name of the agent.")
    workingStatus: str = Field(..., description="Rigid string representing the working status.")
    doneStatus: str = Field(..., description="Rigid string representing the done/completed status.")
    trace: str = Field(..., description="The detailed system/thought trace of this agent.")

class TaskSchema(BaseModel):
    time: str = Field(..., description="Time of the task.")
    title: str = Field(..., description="Title of the task.")
    description: str = Field(..., description="Detailed description.")
    status: str = Field(default="done", description="Status of the task.")

class SwarmResponse(BaseModel):
    agents: List[AgentSchema]
    tasks: List[TaskSchema]
    voice_narration: str
    voice_settings: VoiceSettingsSchema
    detected_language: DetectedLanguageSchema

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: Optional[str] = None
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    class Config:
        from_attributes = True

