/**
 * Speech synthesis utility wrappers for Hinglish / Indian accent text narration
 */
export const speakText = (text, onStart, onEnd, onError) => {
  if (!('speechSynthesis' in window)) {
    if (onError) onError('Speech synthesis not supported')
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'en-US'
  utterance.rate = 1.0  // natural speaking rate
  utterance.pitch = 1.0 // natural pitch

  const voices = window.speechSynthesis.getVoices()
  const preferredVoices = [
    'Microsoft Jenny Online (Natural)',
    'Microsoft Aria Online (Natural)',
    'Google US English',
    'Samantha',
    'Zira',
    'Microsoft Zira Desktop - English (United States)'
  ]

  let selectedVoice = null

  // 1. Try to find the exact match from our preferred list
  for (const name of preferredVoices) {
    const found = voices.find(v => v.name === name)
    if (found) {
      selectedVoice = found
      break
    }
  }

  // 2. Fallback: Search for any US English female/natural voice by checking names
  if (!selectedVoice) {
    const usVoices = voices.filter(v => v.lang === 'en-US' || v.lang.startsWith('en-US'))
    const femaleUS = usVoices.find(v => {
      const lowerName = v.name.toLowerCase()
      return lowerName.includes('female') || 
             lowerName.includes('jenny') || 
             lowerName.includes('aria') || 
             lowerName.includes('samantha') || 
             lowerName.includes('zira') || 
             lowerName.includes('natural')
    })
    if (femaleUS) {
      selectedVoice = femaleUS
    } else if (usVoices.length > 0) {
      selectedVoice = usVoices[0]
    }
  }

  // 3. Fallback: Any English voice
  if (!selectedVoice) {
    const enVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'))
    if (enVoices.length > 0) {
      selectedVoice = enVoices[0]
    }
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice
    console.log('TTS selected voice:', selectedVoice.name)
  } else {
    console.log('No specific US female voice found, using browser default.')
  }

  if (onStart) utterance.onstart = onStart
  if (onEnd) utterance.onend = onEnd
  if (onError) {
    utterance.onerror = onError
  } else {
    utterance.onerror = () => {
      if (onEnd) onEnd()
    }
  }

  window.speechSynthesis.speak(utterance)
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
