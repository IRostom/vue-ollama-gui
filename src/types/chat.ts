/**
 * Chat-related type definitions
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  id?: number
}

export interface Conversation {
  id: string
  title: string
  messages?: ChatMessage[]
  createdAt?: string
  updatedAt?: string
}

export interface Model {
  name: string
  size?: number
  digest?: string
  modified_at?: string
}

export type StreamFrameType = 'start' | 'meta' | 'token' | 'done' | 'error'

export interface StreamFrame {
  type: StreamFrameType
  value?: string
  conversationId?: string
  message?: string
}

export interface SendMessageOptions {
  model: string
  message: ChatMessage
  conversationId?: string
}
