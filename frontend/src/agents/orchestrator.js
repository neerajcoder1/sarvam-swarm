import { SWARM_AGENTS, DAY_PLAN_TASKS, VOICE_NARRATION } from '../data/agents'

/**
 * Handles Swarm planning orchestration, API retrieval, and staggered timer schedules.
 */
export const runSwarmOrchestration = async (
  queryText,
  {
    onDataLoaded,
    onAgentAppear,
    onAgentComplete,
    onSwarmComplete,
    onError
  }
) => {
  let activeData = {
    agents: SWARM_AGENTS,
    tasks: DAY_PLAN_TASKS,
    voice_narration: VOICE_NARRATION
  }

  // Fetch plan updates from backend
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/swarm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: queryText }),
    })

    if (response.ok) {
      const parsed = await response.json()
      if (parsed && parsed.agents && parsed.tasks) {
        activeData = parsed
        console.log("Successfully retrieved data from FastAPI:", parsed)

        // Kick off TTS generation in the background!
        activeData.ttsPromise = fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: parsed.voice_narration,
            language: parsed.detected_language?.language || "english"
          })
        }).then(res => res.json()).then(data => data.audio_base64).catch(err => {
          console.error("TTS fetch failed", err)
          return null
        })
      }
    } else {
      console.warn("Backend returned error status, using default mock data.")
    }
  } catch (err) {
    console.error("Failed to fetch from backend, using default mock data:", err)
    if (onError) onError(err)
  }

  // Notify UI of loaded data
  if (onDataLoaded) {
    onDataLoaded(activeData)
  }

  // Timers tracker array to be cleared if orchestration is reset
  const timers = []

  // Sequential staggered execution (1.2 seconds delay per agent card)
  activeData.agents.forEach((agent, index) => {
    const appearTimer = setTimeout(() => {
      if (onAgentAppear) onAgentAppear(index)

      const completeTimer = setTimeout(() => {
        const isLastAgent = index === activeData.agents.length - 1
        if (onAgentComplete) onAgentComplete(agent.id, isLastAgent)
        
        if (isLastAgent && onSwarmComplete) {
          if (activeData.ttsPromise) {
            activeData.ttsPromise.then(audioBase64 => {
              onSwarmComplete(activeData.voice_narration, activeData.voice_settings, audioBase64 || activeData.audio_base64)
            })
          } else {
            onSwarmComplete(activeData.voice_narration, activeData.voice_settings, activeData.audio_base64)
          }
        }
      }, 1000)

      timers.push(completeTimer)
    }, index * 1200)

    timers.push(appearTimer)
  })

  return timers
}
