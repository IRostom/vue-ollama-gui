<script setup lang="ts">
import { ArrowUpIcon, PlusIcon } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import { computed, ref, watch } from 'vue'
import markdownit from 'markdown-it'
import Spinner from './ui/spinner/Spinner.vue'
import { useRoute, useRouter } from 'vue-router'
import { useChatMessages } from '@/queries/chatMessages'
import { useChat } from '@/queries/chat'

const md = markdownit()
const route = useRoute()
const router = useRouter()

const conversationId = computed(() => {
  return route.params.id ? (route.params.id as string) : undefined
})

watch(conversationId, () => {
  console.log('new chat', conversationId.value)
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chat = ref<any>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chatWithMd = ref<any>([])

const { send: sendMsg, isStreaming, newConversationId, response } = useChat(conversationId)
const responseMd = computed(() => md.render(response.value))

// Track the conversationId we're programmatically navigating to (to skip refetch)
const skipRefetchForId = ref<string | undefined>(undefined)
const { data: chatHistoryServer } = useChatMessages(conversationId, skipRefetchForId)

// Watch conversationId to clear skipRefetch flag when navigating to a different conversation
watch(conversationId, (newId) => {
  // Clear the skip flag when conversationId changes to a different value
  // This allows normal refetching for user-initiated navigation to other conversations
  if (skipRefetchForId.value && newId !== skipRefetchForId.value) {
    skipRefetchForId.value = undefined
  }
})

const chatHistoryServerWithMd = computed(() => {
  return chatHistoryServer.value?.map((m: any) => {
    return { ...m, content: md.render(m.content) }
  })
})

watch(chatHistoryServer, () => {
  chat.value = chatHistoryServer.value ?? []
})
watch(chatHistoryServerWithMd, () => {
  chatWithMd.value = chatHistoryServerWithMd.value
})

watch(responseMd, () => {
  console.log(responseMd)
})

const userMsg = ref('')

const message = computed(() => {
  return { role: 'user', content: userMsg.value }
})

watch(newConversationId, () => {
  if (newConversationId.value) {
    // Set the ID to skip refetch for when programmatically changing route
    skipRefetchForId.value = newConversationId.value
    router.replace(`/${newConversationId.value}`)
  }
})

async function send() {
  chat.value.push(message.value)
  chatWithMd.value.push(message.value)
  sendMsg({
    model: 'gemma3:4b',
    message: { content: userMsg.value, role: 'user' },
  })
  userMsg.value = ''
}

function onEnterKey(e: KeyboardEvent) {
  if (isStreaming.value) return
  // If the user held Shift, we let the textarea handle it (newline)
  if (e.shiftKey) return

  // Prevent the default behaviour – otherwise the textarea would insert a newline
  e.preventDefault()

  // Submit whatever is in `text`
  send()
}
</script>

<template>
  <div class="flex flex-col h-full">
    <article
      v-for="(msg, index) in chatWithMd"
      :key="index"
      class="px-16"
      :class="{ 'pt-12': msg.role === 'user', 'pb-12': msg.role !== 'user' }"
    >
      <div class="mx-auto max-w-3xl">
        <div v-if="msg.role === 'user'" class="rounded-2xl w-fit ms-auto bg-amber-300 p-3">
          {{ msg.content }}
        </div>
        <div v-else class="mx-auto prose lg:prose-lg">
          <div v-html="msg.content"></div>
        </div>
      </div>
    </article>
    <article class="px-16 pb-12">
      <div class="mx-auto max-w-3xl">
        <div class="mx-auto prose lg:prose-lg">
          <Spinner v-if="isStreaming && !responseMd.length" />
          <div v-else v-html="responseMd"></div>
        </div>
      </div>
    </article>
  </div>

  <div class="sticky bottom-0 max-w-3xl w-full mx-auto pb-4 bg-white">
    <InputGroup>
      <InputGroupTextarea
        v-model="userMsg"
        @keydown.enter="onEnterKey"
        placeholder="Ask anything"
      />
      <InputGroupAddon align="block-end">
        <InputGroupButton variant="outline" class="rounded-full" size="icon-xs">
          <PlusIcon class="size-4" />
        </InputGroupButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <InputGroupButton variant="ghost"> Auto </InputGroupButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" class="[--radius:0.95rem]">
            <DropdownMenuItem>Auto</DropdownMenuItem>
            <DropdownMenuItem>Agent</DropdownMenuItem>
            <DropdownMenuItem>Manual</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <!-- <InputGroupText class="ml-auto"> 52% used </InputGroupText> -->
        <!-- <Separator orientation="vertical" class="!h-4" /> -->
        <InputGroupButton
          variant="default"
          class="rounded-full ml-auto"
          size="icon-xs"
          @click="send()"
          :disabled="isStreaming"
        >
          <ArrowUpIcon class="size-4" />
          <span class="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </div>
</template>

<style scoped></style>
