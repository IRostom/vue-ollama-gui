import { useQuery } from '@tanstack/vue-query'

export function useModels() {
  const { isPending, isFetching, isError, data, error } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/ollama/models')
      if (!response.ok) {
        throw new Error(`network response failed:${response.body}`)
      }
      const data = await response.json()
      return data.models as {
        name: string
      }[]
    },
    initialData: [],
    // refetchInterval: 5000,
  })

  return {
    data,
    isFetching,
  }
}
