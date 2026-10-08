import asyncio

class VoiceService:
    def __init__(self):
        self.enabled = False
        print("[VoiceService] Disabled to save RAM on free tier.")
        
    async def generate_speech(self, text, voice="af_heart"):
        # Return none, forcing frontend to use browser speech synthesis
        return None

voice_service = VoiceService()
