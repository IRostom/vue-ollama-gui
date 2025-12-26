import { useQuery } from '@tanstack/vue-query'

export function useChats() {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/conversations')
      if (!response.ok) {
        throw new Error(`network response failed:${response.body}`)
      }
      return response.json()
    },
    initialData: [],
  })

  return {
    data,
    isFetching,
  }
}
