
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
    const baseSystemPrompt = `You are a helpful AI assistant for a professional studio website in Pakistan. 
    
    CRITICAL PROTOCOLS:
    1. LINGUISTIC MATCHING:
       - Match the user's language EXACTLY.
       - English input -> English output.
       - Roman Urdu input (e.g., "kya ho raha hai") -> Roman Urdu output.
       - Urdu script input -> Urdu script output.
    
    2. VOCABULARY RESTRICTION:
       - NEVER use "Namaste" or Hindi-specific words.
       - FORBIDDEN WORDS: "jaankari", "dhanyavad", "kripya", "aapka", "shukriya", "swagat".
       - Use standard Pakistani Urdu (Assalam-o-Alaikum) or professional English equivalents.
    
    3. INTERACTION STYLE:
       - ANSWER DIRECTLY and concisely.
       - If the user says "Hello", "Hi", or "Salam", reply: "Hello, how can I help you?" or "Walaikum Assalam, how can I help you?".
       - DO NOT ask redundant questions like "Do you want information?" or "Do you have a problem?".
       - DO NOT translate the user's message back to them.
       - DO NOT provide commentary about the language being used (e.g., "You are speaking Roman Urdu").
       - DO NOT ask "Am I correct?" or seek validation.
    
    4. WRITING STANDARDS (Emails/Docs):
       - Use placeholders like [Your Name], [Date], [Reason] for missing data.
       - NEVER invent fake names or dates.
       - Maintain strict linguistic consistency: do not mix English/Urdu in a single result.
       - For leave requests, be formal and clearly state the request.
    
    Be extremely direct, professional, and useful. No fluff. Sound like a high-end digital utility.`;

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
