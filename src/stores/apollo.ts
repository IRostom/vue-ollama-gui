import { ref } from 'vue'
import { defineStore } from 'pinia'

interface Chat {
  id: number
  title: string
}

export const useApolloStore = defineStore(
  'apollo',
  () => {
    const userSelectedModel = ref<string | undefined>(undefined)

    function updateUserSelectedModel(v: string | undefined) {
      userSelectedModel.value = v
    }

    return { userSelectedModel, updateUserSelectedModel }
  },
  {
    persist: true,
  },
)
