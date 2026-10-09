/**
 * Speech synthesis utility wrappers for Hinglish / Indian accent text narration
 */

let currentAudioElement = null;
let currentAudioBlobUrl = null;

export const speakText = (text, voiceSettings, onStart, onEnd, onError, audioData = null) => {
  // Always clean up previous audio if running
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.src = "";
    currentAudioElement = null;
  }
  if (currentAudioBlobUrl) {
    URL.revokeObjectURL(currentAudioBlobUrl);
    currentAudioBlobUrl = null;
  }

  // Handle optional voiceSettings for signature backward-compatibility
  let actualSettings = null
  let actualOnStart = onStart
  let actualOnEnd = onEnd
  let actualOnError = onError
  
  if (typeof voiceSettings === 'object' && voiceSettings !== null) {
    actualSettings = voiceSettings
  } else {
    // Shift parameters if voiceSettings is omitted
    actualOnStart = voiceSettings
    actualOnEnd = onStart
    actualOnError = onEnd
  }

  // Attempt HTML5 audio if Base64 audioData was provided from backend
  if (audioData) {
    try {
      console.log('Playing backend-generated audio...');
      // Data URI format: data:audio/wav;base64,...
      const fetchResponse = fetch(audioData);
      
      fetchResponse.then(res => res.blob()).then(blob => {
        currentAudioBlobUrl = URL.createObjectURL(blob);
        currentAudioElement = new Audio(currentAudioBlobUrl);
        
        if (actualOnStart) currentAudioElement.addEventListener('play', actualOnStart);
        if (actualOnEnd) currentAudioElement.addEventListener('ended', actualOnEnd);
        if (actualOnError) currentAudioElement.addEventListener('error', actualOnError);
        
        currentAudioElement.play().catch(e => {
          console.error("Audio playback failed", e);
          if (actualOnError) actualOnError(e);
        });
      }).catch(err => {
        console.error("Failed to parse audio blob", err);
        // Fallback to browser TTS
        fallbackToBrowserTTS(text, actualSettings, actualOnStart, actualOnEnd, actualOnError);
      });
      return;
    } catch (err) {
      console.error("Error setting up audio, falling back to browser TTS", err);
    }
  }

  fallbackToBrowserTTS(text, actualSettings, actualOnStart, actualOnEnd, actualOnError);
}

let activeSentenceCanceller = null

const fallbackToBrowserTTS = (text, actualSettings, actualOnStart, actualOnEnd, actualOnError) => {
  if (!('speechSynthesis' in window)) {
    if (actualOnError) actualOnError('Speech synthesis not supported')
    return
  }
  
  if (activeSentenceCanceller) {
    activeSentenceCanceller()
    activeSentenceCanceller = null
  }
  window.speechSynthesis.cancel()

  // Clean and split paragraph into natural conversational sentences
  const sentences = text
    .split(/(?<=[.!?।\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (sentences.length === 0) {
    if (actualOnEnd) actualOnEnd()
    return
  }

  // Extract parameters from voice_settings
  const locale = actualSettings?.locale || 'en-US'
  const gender = actualSettings?.gender || 'female'
  // Relax speaking rate to 0.92 for natural human cadence (prevents rushed monotone reading)
  const speakingRate = actualSettings?.speaking_rate !== undefined ? actualSettings.speaking_rate : 0.92
  const pitch = actualSettings?.pitch !== undefined ? actualSettings.pitch : 1.0
  const voiceNamePref = actualSettings?.voiceName || actualSettings?.voice_name

  let currentIndex = 0
  let isCancelled = false

  activeSentenceCanceller = () => {
    isCancelled = true
    window.speechSynthesis.cancel()
  }

  // Helper to identify female voice indicators
  const isFemaleVoice = (voiceName) => {
    const lowerName = voiceName.toLowerCase()
    return lowerName.includes('female') || 
           lowerName.includes('jenny') || 
           lowerName.includes('aria') || 
           lowerName.includes('samantha') || 
           lowerName.includes('zira') || 
           lowerName.includes('zoe') || 
           lowerName.includes('sangeeta') || 
           lowerName.includes('swara') ||
           lowerName.includes('heera') ||
           lowerName.includes('madhur') ||
           lowerName.includes('shruti') ||
           lowerName.includes('kanya') ||
           lowerName.includes('pallavi') ||
           lowerName.includes('kalpana')
  }

  const speakNextSentence = () => {
    if (isCancelled || currentIndex >= sentences.length) {
      activeSentenceCanceller = null
      if (actualOnEnd && !isCancelled) actualOnEnd()
      return
    }

    const currentText = sentences[currentIndex]
    const utterance = new SpeechSynthesisUtterance(currentText)
    utterance.lang = locale
    utterance.rate = speakingRate
    utterance.pitch = pitch

    const voices = window.speechSynthesis.getVoices()
    
    // Filter matching voices by locale
    const getVoicesForLocale = (targetLocale) => {
      const targetLower = targetLocale.toLowerCase()
      let matches = voices.filter(v => v.lang.toLowerCase() === targetLower || v.lang.toLowerCase().replace('_', '-') === targetLower)
      if (matches.length === 0) {
        const prefix = targetLower.split('-')[0]
        matches = voices.filter(v => v.lang.toLowerCase().startsWith(prefix))
      }
      return matches
    }

    let localeVoices = getVoicesForLocale(locale)

    if (localeVoices.length === 0) {
      const fallbacks = ['en-in', 'hi-in', 'en-us']
      for (const fb of fallbacks) {
        if (fb.toLowerCase() !== locale.toLowerCase()) {
          localeVoices = getVoicesForLocale(fb)
          if (localeVoices.length > 0) break
        }
      }
    }

    let selectedVoice = null
    
    if (voiceNamePref && voices.length > 0) {
      selectedVoice = voices.find(v => v.name === voiceNamePref || v.name.toLowerCase().includes(voiceNamePref.toLowerCase()))
    }

    if (!selectedVoice && localeVoices.length > 0) {
      const isFemalePref = gender.toLowerCase() === 'female'
      const genderMatches = localeVoices.filter(v => isFemaleVoice(v.name) === isFemalePref)
      if (genderMatches.length > 0) {
        selectedVoice = genderMatches[0]
      } else {
        selectedVoice = localeVoices[0]
      }
    }

    if (!selectedVoice) {
      const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'))
      if (enVoices.length > 0) {
        selectedVoice = enVoices[0]
      } else if (voices.length > 0) {
        selectedVoice = voices[0]
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice
      utterance.lang = selectedVoice.lang
    }

    if (currentIndex === 0 && actualOnStart) {
      actualOnStart()
    }

    utterance.onend = () => {
      currentIndex++
      // Natural 220ms breathing pause between sentences
      setTimeout(() => {
        if (!isCancelled) speakNextSentence()
      }, 220)
    }

    utterance.onerror = (e) => {
      console.warn("Sentence utterance error:", e)
      currentIndex++
      if (!isCancelled) speakNextSentence()
    }

    window.speechSynthesis.speak(utterance)
  }

  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    const handleVoicesChanged = () => {
      speakNextSentence()
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
  } else {
    speakNextSentence()
  }
}

export const cancelSpeech = () => {
  if (activeSentenceCanceller) {
    activeSentenceCanceller()
    activeSentenceCanceller = null
  }
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.src = "";
    currentAudioElement = null;
  }
  if (currentAudioBlobUrl) {
    URL.revokeObjectURL(currentAudioBlobUrl);
    currentAudioBlobUrl = null;
  }

  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Speech Recognition factory initializer
 */
export const createSpeechRecognition = (onResult, onError, onEnd) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    return null
  }

  const recognition = new SpeechRecognition()
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-IN' // Indian English accent context

  if (onResult) {
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }
  }

  if (onError) {
    recognition.onerror = onError
  }

  if (onEnd) {
    recognition.onend = onEnd
  }

  return recognition
}

export const getAvailableVoices = () => {
  if (!('speechSynthesis' in window)) return []
  return window.speechSynthesis.getVoices()
}

