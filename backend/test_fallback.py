import requests
import json
import base64
import time

URL = "http://localhost:8002/api/swarm"

def test_fallback():
    print("Testing fallback/error flow...")
    payload = {"query": "gibberish no logic asdf"}
    
    start_time = time.time()
    response = requests.post(URL, json=payload)
    print(f"Request took {time.time() - start_time:.2f} seconds")
    
    if response.status_code == 200:
        data = response.json()
        audio_base64 = data.get("audio_base64")
        if audio_base64:
            print(f"SUCCESS: Audio generated. Size: {len(audio_base64)} characters")
        else:
            print("audio_base64 is missing, which might be correct if fallback voice_narration is not valid or TTS failed.")
            print(f"Narrator: {data.get('voice_narration')}")
    else:
        print(f"ERROR: {response.text}")

if __name__ == "__main__":
    test_fallback()
