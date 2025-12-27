import { ref, type Ref } from 'vue'
import { sendMessage } from '@/api/chatService'
import type { SendMessageOptions, StreamFrame } from '@/types/chat'

export function useChat(conversationId: Ref<string | undefined>) {
  const isStreaming: Ref<boolean> = ref(false)
  const response: Ref<string> = ref('')
  const newConversationId: Ref<string> = ref('')

  const send = async (options: SendMessageOptions) => {
    const { model, message } = options

    // Reset state
    isStreaming.value = true
    response.value = ''

    try {
      await sendMessage(
        {
          model,
          message,
          conversationId: conversationId?.value || undefined,
        },
        (frame: StreamFrame) => {
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
        },
      )
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
