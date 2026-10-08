import requests
import time
import json

URL = "http://localhost:8000/api/swarm"

def test_api():
    print("Testing normal flow...")
    payload = {"query": "Schedule a healthy lunch for me."}
    
    start_time = time.time()
    response = requests.post(URL, json=payload)
    print(f"Request took {time.time() - start_time:.2f} seconds")
    
    if response.status_code == 200:
        data = response.json()
        audio_base64 = data.get("audio_base64")
        if audio_base64:
            print(f"SUCCESS: Audio generated. Size: {len(audio_base64)} characters")
            print(f"Prefix: {audio_base64[:50]}")
        else:
            print("FAILURE: audio_base64 is missing!")
            print(data)
    else:
        print(f"ERROR: Status code {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    test_api()
