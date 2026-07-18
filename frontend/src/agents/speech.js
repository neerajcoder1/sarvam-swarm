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
  utterance.lang = 'hi-IN' // Hinglish locale voice context
  utterance.rate = 0.95

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
