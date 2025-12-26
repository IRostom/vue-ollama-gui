import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

interface Chat {
  id: number
  title: string
}

export const useCounterStore = defineStore('chats', () => {
  const chats = ref<Chat[]>([])
  // const doubleCount = computed(() => count.value * 2)
  function updateChats(v: Chat[]) {
    chats.value = v
  }

  return { chats, updateChats }
})
