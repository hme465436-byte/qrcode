'use server';

/**
 * @fileOverview Advanced Server Actions for the AI Chatbot.
 * Implements a dual-node strategy: Groq (Primary) -> OpenRouter (Fallback).
 * Supports full conversation memory and error telemetry.
 */

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatConfig {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  maxTokens?: number;
  node?: 'auto' | 'groq' | 'openrouter';
}

export async function chatWithAI(messages: ChatMessage[], config: ChatConfig = {}) {
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const orKey = (process.env.OPENROUTER_API_KEY || '').trim();

  const systemMessage: ChatMessage = {
    role: 'system',
    content: config.systemPrompt || 'You are a professional AI assistant. Your tone is helpful and technically accurate.'
  };

  const payload = [systemMessage, ...messages];
  const temperature = config.temperature ?? 0.7;

  let lastError = '';

  // 1. Primary Node: Groq (Llama 3.3 Protocol)
  if (config.node === 'auto' || config.node === 'groq') {
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model || 'llama-3.3-70b-versatile',
            messages: payload,
            temperature: temperature,
            max_tokens: config.maxTokens || 2048,
          }),
          cache: 'no-store'
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.choices?.[0]?.message?.content) {
          return { 
            success: true, 
            text: data.choices[0].message.content, 
            node: 'Groq (Llama 3.3)' 
          };
        } else {
          lastError = data.error?.message || `Groq Node Error (${response.status})`;
        }
      } catch (e: any) {
        lastError = `Groq Connection Failed: ${e.message}`;
      }
    }
  }

  // 2. Fallback Node: OpenRouter (Llama 3.1 Protocol)
  if (config.node === 'auto' || config.node === 'openrouter') {
    if (orKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${orKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://mykittool.app',
            'X-Title': 'MY KIT TOOL',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct',
            messages: payload,
            temperature: temperature,
          }),
          cache: 'no-store'
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.choices?.[0]?.message?.content) {
          return { 
            success: true, 
            text: data.choices[0].message.content, 
            node: 'OpenRouter (Llama 3.1)' 
          };
        } else {
          lastError = data.error?.message || `OpenRouter Node Error (${response.status})`;
        }
      } catch (e: any) {
        lastError = `OpenRouter Connection Failed: ${e.message}`;
      }
    }
  }

  return { 
    success: false, 
    message: lastError || 'All AI discovery nodes are currently restricted or unreachable.' 
  };
}
