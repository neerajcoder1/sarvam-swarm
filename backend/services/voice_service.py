import asyncio

class VoiceService:
    def __init__(self):
        self.enabled = False
        print("[VoiceService] Disabled to save RAM on free tier.")
        
    async def generate_speech(self, text, voice="af_heart"):
        return None
        
    def generate_audio_base64(self, text, language="english"):
        return None

voice_service = VoiceService()