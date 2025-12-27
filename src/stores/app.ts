import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAppStore = defineStore(
  'app',
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

