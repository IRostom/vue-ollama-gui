<script setup lang="ts">
import type { ChatMessage } from '@/types/chat'
import { computed } from 'vue'
import Spinner from '@/components/ui/spinner/Spinner.vue'

interface Props {
  message: ChatMessage
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
})

const isUser = computed(() => props.message.role === 'user')
const isAssistant = computed(() => props.message.role === 'assistant')
</script>

<template>
  <Spinner v-if="isLoading && isAssistant && !message.content.length" />
  <div
    v-else-if="isUser"
    class="rounded-2xl w-fit ms-auto bg-amber-300 p-3"
    v-html="message.content"
  ></div>
  <div v-else-if="isAssistant" class="mx-auto prose lg:prose-lg">
    <div v-html="message.content"></div>
  </div>
</template>
