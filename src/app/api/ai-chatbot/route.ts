
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Chatbot.
 * Accesses private API keys and performs multi-node failover.
 * Enhanced system instruction matrix for peak quality.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages, config } = await req.json();

    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    const orKey = (process.env.OPENROUTER_API_KEY || '').trim();

    // 1. Pre-flight Validation
    if (!groqKey && !orKey) {
      return NextResponse.json({ 
        success: false, 
        message: "API Keys (GROQ_API_KEY or OPENROUTER_API_KEY) are missing from the server environment." 
      }, { status: 500 });
    }

    // Advanced Quality Control: Strong System Instruction Fallback
    const systemMessage = {
      role: 'system',
      content: config.systemPrompt || 'You are a highly capable and professional AI assistant. Provide clear, accurate, and contextually relevant answers. Stay on topic and be as helpful as possible while maintaining a professional tone. Provide detailed explanations when needed, and be concise only when requested.'
    };

    // Optimize context window for reliability (Last 10 messages)
    const payload = [systemMessage, ...messages.slice(-10)];
    const temperature = config.temperature ?? 0.7;

    // 2. Primary Node: Groq (Llama 3.3)
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

    // 3. Fallback Node: OpenRouter (Llama 3.1)
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
      message: "Infrastructure Alert: Discovery nodes unreachable. Verify API keys and quotas." 
    }, { status: 502 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Internal Matrix Error: " + (err.message || "Unknown Failure") 
    }, { status: 500 });
  }
}
