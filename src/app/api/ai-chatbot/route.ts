import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Chatbot.
 * Accesses private API keys and performs multi-node failover.
 * Support for Custom User API Nodes with Auto-Detection.
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

      // --- AUTO-DETECTION MATRIX ---
      let effectiveUrl = apiUrl?.trim();
      let effectiveModel = modelName?.trim();

      if (!effectiveUrl || !effectiveModel) {
        if (trimmedKey.startsWith('gsk_')) {
          effectiveUrl = effectiveUrl || 'https://api.groq.com/openai/v1/chat/completions';
          effectiveModel = effectiveModel || 'llama-3.1-8b-instant';
        } else if (trimmedKey.startsWith('sk-or-')) {
          effectiveUrl = effectiveUrl || 'https://openrouter.ai/api/v1/chat/completions';
          effectiveModel = effectiveModel || 'meta-llama/llama-3.1-8b-instruct';
        } else if (trimmedKey.startsWith('AIza')) {
          // Google Gemini OpenAI-Compatible Endpoint
          effectiveUrl = effectiveUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
          effectiveModel = effectiveModel || 'gemini-1.5-flash';
        } else if (trimmedKey.startsWith('sk-')) {
          effectiveUrl = effectiveUrl || 'https://api.openai.com/v1/chat/completions';
          effectiveModel = effectiveModel || 'gpt-4o-mini';
        }
      }

      if (!effectiveUrl) {
        return NextResponse.json({ 
          success: false, 
          message: "Custom Node Error: API URL could not be auto-detected. Please enter it manually." 
        }, { status: 400 });
      }

      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${trimmedKey}`,
          'Content-Type': 'application/json',
        };

        if (customHeader) {
          try {
            const extra = JSON.parse(customHeader);
            Object.assign(headers, extra);
          } catch (e) {
            console.warn("Could not parse custom headers.");
          }
        }

        const response = await fetch(effectiveUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: effectiveModel || 'gpt-4o-mini',
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
            node: config.customApi.providerName || 'Custom Node' 
          });
        } else {
          const errorMsg = data.error?.message || data.message || `Node Rejection: HTTP ${response.status}`;
          return NextResponse.json({ 
            success: false, 
            message: errorMsg 
          }, { status: response.status || 500 });
        }
      } catch (err: any) {
        return NextResponse.json({ 
          success: false, 
          message: `Custom Node Handshake Error: ${err.message}` 
        }, { status: 500 });
      }
    }

    // 2. Pre-flight Validation for Native Nodes
    if (!groqKey && !orKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Studio Alert: Primary nodes unreachable. Please check server environment keys." 
      }, { status: 500 });
    }

    // 3. Primary Node: Groq (Llama 3.3)
    if ((config.node === 'auto' || config.node === 'groq') && groqKey) {
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

        const data = await response.json();

        if (response.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({ 
            success: true, 
            text: data.choices[0].message.content, 
            node: 'Groq (Llama 3.3)' 
          });
        } else if (config.node === 'groq') {
          return NextResponse.json({ 
            success: false, 
            message: data.error?.message || `Groq Node Error: HTTP ${response.status}` 
          }, { status: response.status });
        }
      } catch (e: any) {
        if (config.node === 'groq') throw e;
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
