'use server';

/**
 * @fileOverview Server-side logic for the AI Chatbot.
 * Implements a dual-node strategy: Groq (Primary) -> OpenRouter (Fallback).
 */

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export async function chatWithAI(messages: ChatMessage[]) {
  const groqKey = process.env.GROQ_API_KEY;
  const orKey = process.env.OPENROUTER_API_KEY;

  if (!groqKey && !orKey) {
    return { 
      success: false, 
      error: 'CONFIG_MISSING', 
      message: 'Node restricted. Add GROQ_API_KEY or OPENROUTER_API_KEY to server environment.' 
    };
  }

  const systemPrompt: ChatMessage = {
    role: 'system',
    content: 'You are a professional AI assistant in the MY KIT TOOL digital studio. Your tone is helpful, concise, and technically accurate. You help users with various digital tasks. Never use markdown formatting that could break simple text views unless necessary.'
  };

  const payload = [systemPrompt, ...messages];

  // 1. Primary Node: Groq (High Speed)
  if (groqKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: payload,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          text: data.choices[0].message.content, 
          node: 'Groq (Llama 3.3)' 
        };
      } else {
        const err = await response.json();
        console.warn('Groq Node Error:', err);
      }
    } catch (e) {
      console.warn('Groq uplink interrupted, switching to fallback node.');
    }
  }

  // 2. Fallback Node: OpenRouter (Resilient)
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
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: payload,
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
    message: 'All cryptographic AI discovery nodes are currently restricted.' 
  };
}
