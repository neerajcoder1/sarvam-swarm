import os
from google import genai

client = genai.Client()
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello"
    )
    print("gemini-2.5-flash:", response.text)
except Exception as e:
    print("gemini-2.5-flash failed:", e)

try:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Say hello"
    )
    print("gemini-1.5-flash:", response.text)
except Exception as e:
    print("gemini-1.5-flash failed:", e)

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp",
        contents="Say hello"
    )
    print("gemini-2.0-flash-exp:", response.text)
except Exception as e:
    print("gemini-2.0-flash-exp failed:", e)
