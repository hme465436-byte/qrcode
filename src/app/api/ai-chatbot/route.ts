import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Chatbot.
 * Accesses private API keys and performs multi-node failover.
 * Support for Custom User API Nodes with Auto-Detection and Model Fallbacks.
 * Updated to use current Groq models (Llama 3.1/3.3) and remove dead Mixtral nodes.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages, config } = await req.json();

    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    const orKey = (process.env.OPENROUTER_API_KEY || '').trim();

    // Advanced Quality Control: Strong System Instruction Fallback
    const systemMessage = {
      role: 'system',
      content: config.systemPrompt || 'You are a highly capable and professional AI assistant. Provide clear, accurate, and contextually relevant answers.'
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
          message: "Custom Node Error: API Key is required for personal node integration." 
        }, { status: 400 });
      }

      // --- PROVIDER DETECTION & MODEL MATRIX ---
      let effectiveUrl = apiUrl?.trim();
      let providerName = config.customApi.providerName || 'Custom Node';
      let fallbackModels: string[] = [];

      if (trimmedKey.startsWith('gsk_')) {
        providerName = 'Groq Cloud';
        effectiveUrl = effectiveUrl || 'https://api.groq.com/openai/v1/chat/completions';
        // Updated to remove decommissioned Mixtral models
        fallbackModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'];
      } else if (trimmedKey.startsWith('sk-or-')) {
        providerName = 'OpenRouter';
        effectiveUrl = effectiveUrl || 'https://openrouter.ai/api/v1/chat/completions';
        fallbackModels = ['meta-llama/llama-3.1-8b-instruct', 'meta-llama/llama-3.1-8b-instruct:free', 'openrouter/auto'];
      } else if (trimmedKey.startsWith('AIza')) {
        providerName = 'Google Gemini';
        effectiveUrl = effectiveUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
        fallbackModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
      } else if (trimmedKey.startsWith('sk-')) {
        providerName = 'OpenAI';
        effectiveUrl = effectiveUrl || 'https://api.openai.com/v1/chat/completions';
        fallbackModels = ['gpt-4o-mini', 'gpt-4o'];
      } else {
        // Generic fallback for unknown prefixes
        effectiveUrl = effectiveUrl || 'https://api.openai.com/v1/chat/completions';
        fallbackModels = ['gpt-4o-mini'];
      }

      // If user typed a model, try that first
      if (modelName?.trim()) {
        fallbackModels = [modelName.trim(), ...fallbackModels.filter(m => m !== modelName.trim())];
      }

      if (!effectiveUrl) {
        return NextResponse.json({ 
          success: false, 
          message: "Custom Node Error: API URL could not be auto-detected. Please enter it manually." 
        }, { status: 400 });
      }

      // --- ITERATIVE EXECUTION LOOP ---
      let lastError = null;
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
              text: data.choices[0].message.content, 
              node: `${providerName} (${model})` 
            });
          } else {
            const errorMsg = data.error?.message || data.message || `HTTP ${response.status}`;
            lastError = errorMsg;
            // If it's a model error, continue to next fallback
            if (errorMsg.toLowerCase().includes('model') || errorMsg.toLowerCase().includes('exist') || errorMsg.toLowerCase().includes('support')) {
              continue;
            } else {
              // For auth or other critical errors, break early
              break;
            }
          }
        } catch (err: any) {
          lastError = err.message;
          continue;
        }
      }

      return NextResponse.json({ 
        success: false, 
        message: `Custom Node Failure [${providerName}]: ${lastError || 'All fallback models restricted.'}` 
      }, { status: 500 });
    }

    // 2. Pre-flight Validation for Native Nodes
    if (!groqKey && !orKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Studio Alert: Primary nodes unreachable. Please check server environment keys." 
      }, { status: 500 });
    }

    // 3. Primary Node: Groq (Updated Model Hierarchy)
    if ((config.node === 'auto' || config.node === 'groq') && groqKey) {
      const groqModels = config.model ? [config.model] : ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'];
      
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
              text: data.choices[0].message.content, 
              node: `Groq (${model})` 
            });
          } else {
            const errorMsg = data.error?.message || "";
            // Only retry if it's a model issue and we have more models to try
            if (groqModels.length > 1 && (errorMsg.toLowerCase().includes('model') || errorMsg.toLowerCase().includes('support'))) {
              continue;
            }
            // If explicit "groq" node selected and first fails, we might want to return error
            if (config.node === 'groq') {
              return NextResponse.json({ 
                success: false, 
                message: data.error?.message || `Groq Node Error: HTTP ${response.status}` 
              }, { status: response.status });
            }
            break; // Break and try OpenRouter
          }
        } catch (e: any) {
          if (config.node === 'groq' && groqModels.length === 1) throw e;
        }
      }
    }

    // 4. Fallback Node: OpenRouter (Llama 3.1)
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
            text: data.choices[0].message.content, 
            node: 'OpenRouter (Llama 3.1)' 
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: data.error?.message || `OpenRouter Node Error: HTTP ${response.status}` 
          }, { status: response.status });
        }
      } catch (e: any) {
        return NextResponse.json({ 
          success: false, 
          message: `Network Protocol Error: ${e.message}` 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: "Infrastructure Alert: Discovery nodes unreachable." 
    }, { status: 502 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Internal Matrix Error: " + (err.message || "Unknown Failure") 
    }, { status: 500 });
  }
}
