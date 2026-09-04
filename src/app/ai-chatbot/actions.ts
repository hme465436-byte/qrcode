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
  const groqKey = process.env.GROQ_API_KEY;
  const orKey = process.env.OPENROUTER_API_KEY;

  if (!groqKey && !orKey) {
    return { 
      success: false, 
      error: 'CONFIG_MISSING', 
      message: 'Uplink Restricted: Add GROQ_API_KEY or OPENROUTER_API_KEY to server environment.' 
    };
  }

  const systemMessage: ChatMessage = {
    role: 'system',
    content: config.systemPrompt || 'You are a professional AI assistant in the MY KIT TOOL digital studio. Your tone is helpful, concise, and technically accurate.'
  };

  const payload = [systemMessage, ...messages];
  const temperature = config.temperature ?? 0.7;

  // 1. Primary Node: Groq
  if (groqKey && (config.node === 'auto' || config.node === 'groq')) {
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
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          text: data.choices[0].message.content, 
          node: 'Groq (Llama 3.3)' 
        };
      }
    } catch (e) {
      console.warn('Groq node timeout, seeking fallback.');
    }
  }

  // 2. Fallback Node: OpenRouter
  if (orKey && (config.node === 'auto' || config.node === 'openrouter')) {
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
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          text: data.choices[0].message.content, 
          node: 'OpenRouter (Llama 3.1)' 
        };
      }
    } catch (e) {
      console.warn('OpenRouter uplink failure.');
    }
  }

  return { 
    success: false, 
    error: 'NODES_UNREACHABLE', 
    message: 'All cryptographic AI discovery nodes are currently restricted or unreachable.' 
  };
}
