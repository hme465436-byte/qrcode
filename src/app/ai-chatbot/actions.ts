/**
 * @fileOverview Types for the AI Chatbot.
 * Logic moved to /api/ai-chatbot/route.ts for Vercel security.
 */

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface CustomApiConfig {
  providerName: string;
  apiUrl: string;
  apiKey: string;
  modelName: string;
  customHeader?: string;
}

export interface ChatConfig {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  maxTokens?: number;
  node?: 'auto' | 'groq' | 'openrouter' | 'custom';
  customApi?: CustomApiConfig;
}
