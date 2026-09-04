import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Chatbot.
 * Accesses private API keys and performs multi-node failover.
 * Support for Custom User API Nodes added.
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
      const { apiUrl, apiKey, modelName, customHeader } = config.customApi;
      
      if (!apiUrl || !apiKey) {
        return NextResponse.json({ 
          success: false, 
          message: "Custom Node Error: API URL or Key is missing from your local configuration." 
        }, { status: 400 });
      }

      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${apiKey.trim()}`,
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

        const response = await fetch(apiUrl.trim(), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: modelName || 'default',
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
          return NextResponse.json({ 
            success: false, 
            message: data.error?.message || `Custom Node Failure: HTTP ${response.status}` 
          }, { status: response.status });
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
