
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Chatbot.
 * Accesses private API keys and performs multi-node failover.
 * Support for Custom User API Nodes with Auto-Detection and Model Fallbacks.
 * Sanitize error messages to hide provider identity.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages, config } = await req.json();

    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    const orKey = (process.env.OPENROUTER_API_KEY || '').trim();

    // Advanced Quality Control: Strong System Instruction Fallback
    // Specifically configured for Pakistan-region users (Urdu/English preference)
    const baseSystemPrompt = `You are a highly capable and professional AI assistant. 
    
    CRITICAL LINGUISTIC RULES:
    - Answer the user directly and usefully.
    - If the user writes in English, reply in professional English.
    - If the user writes in Roman Urdu (e.g., "kya ho raha hai"), reply naturally in Roman Urdu.
    - If the user writes in Urdu script, reply in proper Urdu.
    - DO NOT use Hindi-specific words (e.g., "dhanyavad", "kripya", "aapka", "shukriya vahana", "namaste"). Use standard Urdu/English equivalents.
    - DO NOT translate the user's message back to them unless explicitly asked.
    - DO NOT provide meta-commentary about the language (e.g., "You are speaking Hindi" or "You switched to Urdu").
    - DO NOT ask "Am I correct?" or seek validation for interpreting the user's style.
    
    WRITING RULES (For Emails and Documents):
    - Generate real, usable drafts based ONLY on provided details.
    - Use clear placeholders like [Your Name], [Date], [Reason] for missing information.
    - NEVER invent fake names or use old/historical dates from training data.
    - Maintain strict linguistic consistency: do not mix languages in a single response.
    - Ensure professional intent: a leave request must explicitly request leave.
    
    Be short, clear, and professional. Sound like a high-end digital assistant, not a language teacher.`;

    const systemMessage = {
      role: 'system',
      content: config.systemPrompt ? `${baseSystemPrompt}\n\nUSER-SPECIFIED PERSONA: ${config.systemPrompt}` : baseSystemPrompt
    };

    const payload = [systemMessage, ...messages.slice(-10)];
    const temperature = config.temperature ?? 0.7;

    // 1. Check for Custom Node Protocol
    if (config.node === 'custom' && config.customApi) {
      let { apiUrl, apiKey, modelName, customHeader } = config.customApi;
      const trimmedKey = (apiKey || '').trim();
      
      if (!trimmedKey) {
        return NextResponse.json({ 
          success: false, 
          message: "API Key is required for private node integration." 
        }, { status: 400 });
      }

      // --- PROVIDER DETECTION & MODEL MATRIX ---
      let effectiveUrl = apiUrl?.trim();
      let fallbackModels: string[] = [];

      if (trimmedKey.startsWith('gsk_')) {
        effectiveUrl = effectiveUrl || 'https://api.groq.com/openai/v1/chat/completions';
        fallbackModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'];
      } else if (trimmedKey.startsWith('sk-or-')) {
        effectiveUrl = effectiveUrl || 'https://openrouter.ai/api/v1/chat/completions';
        fallbackModels = ['meta-llama/llama-3.1-8b-instruct', 'meta-llama/llama-3.1-8b-instruct:free', 'openrouter/auto'];
      } else if (trimmedKey.startsWith('AIza')) {
        effectiveUrl = effectiveUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        fallbackModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
      } else if (trimmedKey.startsWith('sk-')) {
        effectiveUrl = effectiveUrl || 'https://api.openai.com/v1/chat/completions';
        fallbackModels = ['gpt-4o-mini', 'gpt-4o'];
      } else {
        effectiveUrl = effectiveUrl || 'https://api.openai.com/v1/chat/completions';
        fallbackModels = ['gpt-4o-mini'];
      }

      if (modelName?.trim()) {
        fallbackModels = [modelName.trim(), ...fallbackModels.filter(m => m !== modelName.trim())];
      }

      if (!effectiveUrl) {
        return NextResponse.json({ 
          success: false, 
          message: "API URL could not be auto-detected." 
        }, { status: 400 });
      }

      // --- ITERATIVE EXECUTION LOOP ---
      for (const model of fallbackModels) {
        try {
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${trimmedKey}`,
            'Content-Type': 'application/json',
          };

          if (customHeader) {
            try {
               const extra = JSON.parse(customHeader);
               Object.assign(headers, extra);
            } catch (e) {}
          }

          const response = await fetch(effectiveUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: model,
              messages: payload,
              temperature: temperature,
              max_tokens: config.maxTokens || 2048,
            }),
            cache: 'no-store'
          });

          const data = await response.json();

          if (response.ok && data.choices?.[0]?.message?.content) {
            return NextResponse.json({ 
              success: true, 
              text: data.choices[0].message.content 
            });
          }
        } catch (err: any) {
          continue;
        }
      }

      return NextResponse.json({ 
        success: false, 
        message: "Service unavailable. Please try again." 
      }, { status: 500 });
    }

    // 2. Pre-flight Validation for Native Nodes
    if (!groqKey && !orKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Service unavailable. Please try again." 
      }, { status: 500 });
    }

    // 3. Primary Node: Groq
    if ((config.node === 'auto' || config.node === 'groq') && groqKey) {
      const groqModels = config.model ? [config.model] : ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];
      
      for (const model of groqModels) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${groqKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: model,
              messages: payload,
              temperature: temperature,
              max_tokens: config.maxTokens || 2048,
            }),
            cache: 'no-store'
          });

          const data = await response.json();
          if (response.ok && data.choices?.[0]?.message?.content) {
            return NextResponse.json({ 
              success: true, 
              text: data.choices[0].message.content 
            });
          }
        } catch (e: any) {
          continue;
        }
      }
    }

    // 4. Fallback Node: OpenRouter
    if ((config.node === 'auto' || config.node === 'openrouter') && orKey) {
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

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({ 
            success: true, 
            text: data.choices[0].message.content 
          });
        }
      } catch (e: any) {}
    }

    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Please try again." 
    }, { status: 502 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Please try again." 
    }, { status: 500 });
  }
}
