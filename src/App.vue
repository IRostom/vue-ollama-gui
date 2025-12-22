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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
        <!-- <div class="grid auto-rows-min gap-4 md:grid-cols-3">
          <div class="bg-muted/50 aspect-video rounded-xl" />
          <div class="bg-muted/50 aspect-video rounded-xl" />
          <div class="bg-muted/50 aspect-video rounded-xl" />
        </div> -->
        <div class="bg-muted/50 h-screen flex-1 rounded-xl md:h-min">
          <!-- <ScrollArea class="h-svh relative"> -->
          <div class="flex flex-col gap-3 h-full">
            <div v-for="(msg, index) in chatWithMd" :key="index">
              <div
                v-if="msg.role === 'user'"
                class="p-1.5 bg-amber-300 max-w-9/12 rounded-2xl ms-auto"
              >
                {{ msg.content }}
              </div>
              <div v-else class="p-2 bg-amber-50 rounded-2xl">
                <div v-html="msg.content"></div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0">
            <InputGroup class="bg-white">
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
                <InputGroupButton
                  variant="default"
                  class="rounded-full"
                  size="icon-xs"
                  @click="send()"
                >
                  <ArrowUpIcon class="size-4" />
                  <span class="sr-only">Send</span>
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <!-- </ScrollArea> -->
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<style scoped></style>
