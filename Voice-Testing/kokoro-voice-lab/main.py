
from kokoro import KPipeline
import soundfile as sf
import os

# Create output directory
os.makedirs("outputs", exist_ok=True)

# Initialize Kokoro English pipeline
pipeline = KPipeline(lang_code="a")

# Same text for every voice to make comparison fair
text = """
Hello! Welcome to SwarmAssist.
I am your personal AI assistant.
I can help you organize your daily tasks,
manage your schedule, and maintain a healthy balance
between productivity and wellness.
Let's make your day easier and more productive.
"""

# Female voices to compare
voices = [
    "af_heart",
    "af_bella",
    "af_nicole"
]

for voice in voices:
    print(f"\nGenerating voice: {voice}")

    generator = pipeline(
        text,
        voice=voice,
        speed=1
    )

    audio_chunks = []

    for _, _, audio in generator:
        audio_chunks.append(audio)

    # Combine audio chunks
    import numpy as np
    final_audio = np.concatenate(audio_chunks)

    # Save WAV file
    output_path = f"outputs/{voice}.wav"

    sf.write(
        output_path,
        final_audio,
        24000
    )

    print(f"Saved: {output_path}")

print("\nAll voices generated successfully!")