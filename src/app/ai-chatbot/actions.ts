'use server';

/**
 * @fileOverview Overhauled Server Actions for the AI Chatbot.
 * Optimized for Vercel production stability with clinical error telemetry.
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
  // 1. Strict Server-Side Environment Extraction
  const groqKey = (process.env.GROQ_API_KEY || '').trim();
  const orKey = (process.env.OPENROUTER_API_KEY || '').trim();

  // 2. Pre-flight Infrastructure Validation
  if (!groqKey && !orKey) {
    return { 
      success: false, 
      message: "Infrastructure Alert: API keys (GROQ_API_KEY or OPENROUTER_API_KEY) are missing on the server. Please configure environment variables in the Vercel Dashboard." 
    };
  }

  const systemMessage: ChatMessage = {
    role: 'system',
    content: config.systemPrompt || 'You are a professional AI assistant. Your tone is helpful and technically accurate.'
  };

  // Optimize context for free-tier limits
  const contextWindow = messages.slice(-10);
  const payload = [systemMessage, ...contextWindow];
  const temperature = config.temperature ?? 0.7;

  let diagnosticReports: string[] = [];

  // 3. Primary Node logic: Groq (Llama 3.3)
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
          const groqError = data.error?.message || `HTTP ${response.status}`;
          diagnosticReports.push(`Groq: ${groqError}`);
        }
      } catch (e: any) {
        diagnosticReports.push(`Groq Connection: ${e.message}`);
      }
    } else if (config.node === 'groq') {
      diagnosticReports.push("Groq Node: API Key is not set.");
    }
  }

  // 4. Fallback Node Logic: OpenRouter (Llama 3.1)
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
          const orError = data.error?.message || `HTTP ${response.status}`;
          diagnosticReports.push(`OpenRouter: ${orError}`);
        }
      } catch (e: any) {
        diagnosticReports.push(`OpenRouter Connection: ${e.message}`);
      }
    } else if (config.node === 'openrouter') {
      diagnosticReports.push("OpenRouter Node: API Key is not set.");
    }
  }

  // 5. Consolidated Failure Report
  return { 
    success: false, 
    message: diagnosticReports.length > 0 
      ? diagnosticReports.join(' | ') 
      : 'Critical Failure: Discovery nodes unreachable. Verify server network and API quota.' 
  };
}
