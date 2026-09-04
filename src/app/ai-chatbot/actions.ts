'use server';

/**
 * @fileOverview Advanced Server Actions for the AI Chatbot.
 * Implements a dual-node strategy: Groq (Primary) -> OpenRouter (Fallback).
 * Supports dynamic model selection, temperature, and system prompt injection.
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
  // 1. Resolve Credentials Matrix
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const orKey = (process.env.OPENROUTER_API_KEY || '').trim();

  const systemMessage: ChatMessage = {
    role: 'system',
    content: config.systemPrompt || 'You are a professional AI assistant in the MY KIT TOOL digital studio. Your tone is helpful, concise, and technically accurate.'
  };

  const payload = [systemMessage, ...messages];
  const temperature = config.temperature ?? 0.7;

  let lastError = '';

  // 2. Primary Node: Groq (Llama 3.3 Protocol)
  if (config.node === 'auto' || config.node === 'groq') {
    if (!groqKey) {
      lastError = 'Groq API Key is missing in server environment.';
    } else {
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
            max_tokens: config.maxTokens || 1024,
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
          // Diagnostic Capture
          const apiMsg = data.error?.message || response.statusText || 'Handshake failed';
          lastError = `Groq Error (${response.status}): ${apiMsg}`;
          if (response.status === 401) lastError = "Groq: Invalid API Key.";
          if (response.status === 429) lastError = "Groq: Rate limit or Quota reached.";
        }
      } catch (e: any) {
        lastError = `Groq Connection Failed: ${e.message}`;
      }
    }
  }

  // 3. Fallback Node: OpenRouter (Llama 3.1 Protocol)
  if (config.node === 'auto' || config.node === 'openrouter') {
    if (!orKey) {
      lastError = lastError || 'OpenRouter API Key is missing in server environment.';
    } else {
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
            model: 'meta-llama/llama-3.1-8b-instruct:free',
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
          // Diagnostic Capture
          const apiMsg = data.error?.message || response.statusText || 'Handshake failed';
          lastError = `OpenRouter Error (${response.status}): ${apiMsg}`;
          if (response.status === 401) lastError = "OpenRouter: Invalid API Key.";
          if (response.status === 429) lastError = "OpenRouter: Rate limit or Quota reached.";
        }
      } catch (e: any) {
        lastError = `OpenRouter Connection Failed: ${e.message}`;
      }
    }
  }

  // 4. Critical Failure Signal
  return { 
    success: false, 
    error: 'NODES_UNREACHABLE', 
    message: lastError || 'All cryptographic AI nodes are currently restricted or unreachable.' 
  };
}
