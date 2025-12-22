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
import AppSidebar from '@/components/AppSidebar.vue'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

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
    model: 'gpt-oss:20b',
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
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <ScrollArea class="h-svh relative">
        <header
          class="sticky top-0 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white"
        >
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
            <!-- <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="#"> Building Your Application </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb> -->
          </div>
        </header>
        <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
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
                >
                  <ArrowUpIcon class="size-4" />
                  <span class="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </ScrollArea>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped></style>
