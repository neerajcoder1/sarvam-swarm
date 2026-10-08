with open("frontend/src/pages/Dashboard.jsx", "r", encoding="utf-8") as f:
    content = f.read()

import re

new_on_complete = """        onSwarmComplete: (voiceNarration, voiceSettingsObj, audioBase64) => {
          setActiveAgentIndex(-1)
          setSwarmPhase('complete')
          
          setTasksList(prevTasks => {
            const newChat = {
               id: Date.now().toString(),
               title: queryText,
               time: 'Just now',
               tasks: prevTasks
            };
            setChatHistory(prevHistory => {
               const updated = [newChat, ...prevHistory];
               localStorage.setItem('swarm_chat_history', JSON.stringify(updated));
               return updated;
            });
            setActiveChatId(newChat.id);
            return prevTasks;
          });

          triggerVoiceSpeech(voiceNarration, voiceSettingsObj, audioBase64)
        }"""

content = re.sub(r'onSwarmComplete:\s*\([^)]*\)\s*=>\s*\{.*?\n\s*\}', new_on_complete, content, flags=re.DOTALL)

with open("frontend/src/pages/Dashboard.jsx", "w", encoding="utf-8") as f:
    f.write(content)
