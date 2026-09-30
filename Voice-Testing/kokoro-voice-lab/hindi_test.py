
from kokoro import KPipeline
import soundfile as sf
import numpy as np
import os

# Create output directory
os.makedirs("outputs", exist_ok=True)

# Initialize Hindi pipeline
pipeline = KPipeline(lang_code="h")

# Hindi test sentence
text = """
नमस्ते! मैं आपकी व्यक्तिगत AI सहायक हूँ।
मैं आपकी दैनिक गतिविधियों को व्यवस्थित करने,
आपका समय बचाने और आपकी उत्पादकता बढ़ाने में मदद कर सकती हूँ।
आप मुझे अपने काम के बारे में बताइए,
मैं आपके लिए एक बेहतर दिन की योजना तैयार करूँगी।
"""

# Hindi female voices
voices = ["hf_alpha", "hf_beta"]

for voice in voices:

    print(f"\nGenerating Hindi voice: {voice}")

    generator = pipeline(
        text,
        voice=voice,
        speed=1
    )

    audio_chunks = []

    for _, _, audio in generator:
        audio_chunks.append(audio)

    final_audio = np.concatenate(audio_chunks)

    output_path = f"outputs/{voice}.wav"

    sf.write(
        output_path,
        final_audio,
        24000
    )

    print(f"Saved: {output_path}")

print("\nAll Hindi voices generated successfully!")