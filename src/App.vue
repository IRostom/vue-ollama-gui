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
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
import ollama from 'ollama'
import { computed, ref } from 'vue'
import markdownit from 'markdown-it'
import { ScrollArea } from '@/components/ui/scroll-area'

const md = markdownit()
const userMsg = ref('')

const message = computed(() => {
  return { role: 'user', content: userMsg.value }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chat = ref<any>([])
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chatWithMd = ref<any>([])

async function send() {
  chat.value.push(message.value)
  chatWithMd.value.push(message.value)
  userMsg.value = ''

  const response = await ollama.chat({
    model: 'gemma3:4b',
    messages: [...chat.value],
    stream: false,
  })
  chat.value.push(response.message)
  const mdVal = md.render(response.message.content)
  const responsewithMd = {
    ...response.message,
    content: mdVal,
  }
  chatWithMd.value.push(responsewithMd)
  console.log(mdVal)
}

function onEnterKey(e: KeyboardEvent) {
  // If the user held Shift, we let the textarea handle it (newline)
  if (e.shiftKey) return

  // Prevent the default behaviour – otherwise the textarea would insert a newline
  e.preventDefault()

  // Submit whatever is in `text`
  send()
}
</script>

<template>
  <main>
    <ScrollArea class="h-svh w-full relative">
      <div class="flex flex-col gap-3">
        <div v-for="(msg, index) in chatWithMd" :key="index">
          <div v-if="msg.role === 'user'" class="p-1.5 bg-amber-300 max-w-9/12 rounded-2xl ms-auto">
            {{ msg.content }}
          </div>
          <div v-else class="p-2 bg-amber-50 rounded-2xl">
            <div v-html="msg.content"></div>
          </div>
        </div>
      </div>
    </ScrollArea>
    <InputGroup class="sticky bottom-0 bg-white">
      <InputGroupTextarea
        v-model="userMsg"
        @keydown.enter="onEnterKey"
        placeholder="Ask, Search or Chat..."
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
        <InputGroupText class="ml-auto"> 52% used </InputGroupText>
        <Separator orientation="vertical" class="!h-4" />
        <InputGroupButton variant="default" class="rounded-full" size="icon-xs" @click="send()">
          <ArrowUpIcon class="size-4" />
          <span class="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </main>
</template>

<style scoped></style>
