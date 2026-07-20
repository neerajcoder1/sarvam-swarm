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
    const response = await fetch('http://localhost:8000/api/swarm', {
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
          onSwarmComplete(activeData.voice_narration, activeData.voice_settings)
        }
      }, 1000)

      timers.push(completeTimer)
    }, index * 1200)

    timers.push(appearTimer)
  })

  return timers
}
