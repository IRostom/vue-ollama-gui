import type { MaybeRef } from 'node_modules/@tanstack/vue-query/build/modern/types.d.cts'
import { ref, type Ref } from 'vue'

interface ChatMessage {
  role: string
  content: string
}

interface SendOptions {
  model: string
  message: ChatMessage
}

export function useChat(conversationId: Ref<string | undefined>) {
  const isStreaming: Ref<boolean> = ref(false)
  const response: Ref<string> = ref('')
  const newConversationId: Ref<string> = ref('')
  const apiUrl = 'http://localhost:3000'

  const send = async (options: SendOptions) => {
    const { model, message } = options

    // Reset state
    isStreaming.value = true
    response.value = ''

    try {
      const res = await fetch(`${apiUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          message,
          conversationId: conversationId?.value || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      if (!res.body) {
        throw new Error('Response body is null')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines (NDJSON format)
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const frame = JSON.parse(line)

            switch (frame.type) {
              case 'start':
                // Stream started
                break

              case 'meta':
                // Update conversationId from server response
                if (frame.conversationId) {
                  newConversationId.value = frame.conversationId
                }
                break

              case 'token':
                // Accumulate tokens
                if (frame.value) {
                  // console.log('token', frame.value)
                  response.value += frame.value
                }
                break

              case 'done':
                // Stream completed
                isStreaming.value = false
                break

              case 'error':
                // Error occurred
                isStreaming.value = false
                throw new Error(frame.message || 'Unknown error occurred')

              default:
                console.warn('Unknown frame type:', frame.type)
            }
          } catch (parseError) {
            console.error('Error parsing frame:', parseError, 'Line:', line)
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const frame = JSON.parse(buffer)
          if (frame.type === 'token' && frame.value) {
            response.value += frame.value
          }
        } catch (e) {
          // Ignore parse errors for incomplete frames
        }
      }

      isStreaming.value = false
    } catch (error) {
      isStreaming.value = false
      console.error('Error in chat stream:', error)
      throw error
    }
  }

  return {
    isStreaming,
    response,
    newConversationId,
    send,
  }
}
