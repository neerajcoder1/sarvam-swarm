/**
 * Speech synthesis utility wrappers for Hinglish / Indian accent text narration
 */
export const speakText = (text, voiceSettings, onStart, onEnd, onError) => {
  if (!('speechSynthesis' in window)) {
    if (onError) onError('Speech synthesis not supported')
    return
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

  window.speechSynthesis.cancel()

  // Extract parameters from voice_settings
  const locale = actualSettings?.locale || 'en-US'
  const gender = actualSettings?.gender || 'female'
  const speakingRate = actualSettings?.speaking_rate !== undefined ? actualSettings.speaking_rate : 1.0
  const pitch = actualSettings?.pitch !== undefined ? actualSettings.pitch : 1.0

  console.log('--- TTS Debug Log Start ---')
  console.log('Received voice_settings:', actualSettings)

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = locale
  utterance.rate = speakingRate
  utterance.pitch = pitch

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

  const selectVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices()
    
    // Filter matching voices by locale
    const getVoicesForLocale = (targetLocale) => {
      const targetLower = targetLocale.toLowerCase()
      // First try exact match
      let matches = voices.filter(v => v.lang.toLowerCase() === targetLower || v.lang.toLowerCase().replace('_', '-') === targetLower)
      if (matches.length === 0) {
        // Try prefix match (e.g. 'en-IN' -> check if start with 'en-')
        const prefix = targetLower.split('-')[0]
        matches = voices.filter(v => v.lang.toLowerCase().startsWith(prefix))
      }
      return matches
    }

    let localeVoices = getVoicesForLocale(locale)

    // Fallback if no matching voices for locale
    if (localeVoices.length === 0) {
      console.log(`No exact or prefix voices found for locale ${locale}. Trying fallback locales...`)
      const fallbacks = ['en-in', 'hi-in', 'en-us']
      for (const fb of fallbacks) {
        if (fb.toLowerCase() !== locale.toLowerCase()) {
          localeVoices = getVoicesForLocale(fb)
          if (localeVoices.length > 0) {
            console.log(`Gracefully falling back to matching voices from fallback locale: ${fb}`)
            break
          }
        }
      }
    }

    console.log('Available matching voices:', localeVoices.map(v => v.name))

    let selectedVoice = null
    if (localeVoices.length > 0) {
      // Prioritize by gender if available
      const isFemalePref = gender.toLowerCase() === 'female'
      const genderMatches = localeVoices.filter(v => isFemaleVoice(v.name) === isFemalePref)
      if (genderMatches.length > 0) {
        selectedVoice = genderMatches[0]
      } else {
        selectedVoice = localeVoices[0]
      }
    } else {
      // Absolute fallback to first available English voice
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
      console.log('Selected speechSynthesis voice:', selectedVoice.name)
    } else {
      console.log('No specific voice found, using browser default.')
    }

    console.log('Utterance.lang set to:', utterance.lang)
    console.log('--- TTS Debug Log End ---')

    if (actualOnStart) utterance.onstart = actualOnStart
    if (actualOnEnd) utterance.onend = actualOnEnd
    if (actualOnError) {
      utterance.onerror = actualOnError
    } else {
      utterance.onerror = () => {
        if (actualOnEnd) actualOnEnd()
      }
    }

    window.speechSynthesis.speak(utterance)
  }

  // Handle Chrome/Edge where getVoices() returns empty array initially
  const voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    const handleVoicesChanged = () => {
      selectVoiceAndSpeak()
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
  } else {
    selectVoiceAndSpeak()
  }
}

export const cancelSpeech = () => {
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
