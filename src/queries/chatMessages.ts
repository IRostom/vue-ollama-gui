import { useQuery } from '@tanstack/vue-query'
import type { ComputedRef, Ref } from 'vue'

export function useChatMessages(
  chatId: Ref<string | undefined> | ComputedRef<string | undefined>,
  skipRefetchForId?: Ref<string | undefined>,
) {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3000/conversations/${chatId.value}`)
      if (!response.ok) {
        throw new Error(`network response failed:${response.body}`)
      }
      return response.json()
    },
    enabled: () => {
      // Skip refetch if this is the conversationId we're programmatically navigating to
      if (skipRefetchForId?.value && chatId.value === skipRefetchForId.value) {
        return false
      }
      return !!chatId.value
    },
  })

  return {
    data,
    isFetching,
  }
}
