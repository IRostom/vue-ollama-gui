/**
 * Chat composable
 * Handles chat state management and message sending
 */

import { ref, computed, watch } from 'vue'
import { useChat as useChatQuery } from '@/queries/chat'
import { useChatMessages } from '@/queries/chatMessages'
import { useConversation } from './useConversation'
import { renderMarkdown } from './useMarkdown'
import { useAppStore } from '@/stores/app'
import type { ChatMessage } from '@/types/chat'

/**
 * Chat state and operations
 */
export function useChat() {
  const { conversationId, skipRefetchForId, navigateToConversation } = useConversation()
  const appStore = useAppStore()

  const { send: sendMsg, isStreaming, newConversationId, response } = useChatQuery(conversationId)
  const { data: chatHistoryServer } = useChatMessages(conversationId, skipRefetchForId)

  // Local chat state
  const chat = ref<ChatMessage[]>([])
  const chatWithMd = computed(() => {
    return chat.value.map((m) => {
      return { ...m, content: renderMarkdown(m.content) }
    })
  })

  // current message index
  const currUserMsgIndex = ref<number | undefined>(undefined)
  const currAssistantMsgIndex = ref<number | undefined>(undefined)

  // Watch for new conversation ID and navigate
  watch(newConversationId, () => {
    if (newConversationId.value) {
      navigateToConversation(newConversationId.value)
    }
  })

  // Convert chat messages to markdown-rendered versions
  const chatHistoryServerWithMd = computed(() => {
    return (chatHistoryServer.value ?? []).map((m) => {
      return { ...m, content: renderMarkdown(m.content) }
    })
  })

  /**
   * Send a message
   * Model is retrieved from the store automatically
   */
  async function sendMessage(message: ChatMessage) {
    if (!appStore.userSelectedModel) {
      throw new Error('No model selected. Please select a model before sending a message.')
    }

    chat.value.push(message)
    chat.value.push({
      role: 'assistant',
      content: '',
    })
    currUserMsgIndex.value = chat.value.length - 2
    currAssistantMsgIndex.value = chat.value.length - 1

    await sendMsg({
      model: appStore.userSelectedModel,
      message,
    })
  }

  watch([isStreaming, currAssistantMsgIndex, response], () => {
    if (
      !isStreaming.value &&
      currAssistantMsgIndex.value !== undefined &&
      response.value.length > 0
    ) {
      currAssistantMsgIndex.value = undefined
      currUserMsgIndex.value = undefined
    }
    if (
      isStreaming.value &&
      currAssistantMsgIndex.value !== undefined &&
      response.value.length > 0
    ) {
      chat.value[currAssistantMsgIndex.value!] = {
        role: 'assistant',
        content: response.value,
      }
      chatWithMd.value[currAssistantMsgIndex.value!] = {
        role: 'assistant',
        content: renderMarkdown(response.value),
      }
    }
  })

  watch(chatHistoryServer, () => {
    chat.value = []
    currUserMsgIndex.value = undefined
    currAssistantMsgIndex.value = undefined
  })

  watch(conversationId, () => {
    if (conversationId.value) {
      return
    }
    chat.value = []
    currUserMsgIndex.value = undefined
    currAssistantMsgIndex.value = undefined
  })

  const combinedChatMd = computed(() => {
    return [...(chatHistoryServerWithMd.value ?? []), ...chatWithMd.value]
  })

  return {
    chatMd: combinedChatMd,
    isStreaming,
    sendMessage,
  }
}
