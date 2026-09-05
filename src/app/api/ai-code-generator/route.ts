
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Code Generation.
 * Connects to Groq API with multi-model failover.
 * Supports what to build, language, and extra notes parameters.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, extra } = await req.json();
    const apiKey = (process.env.GROQ_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Service unavailable. Node configuration missing." 
      }, { status: 503 });
    }

    const systemPrompt = `You are an expert senior software engineer and architect. 
Your goal is to provide clean, secure, and production-ready code in ${language}.
Rules:
1. Provide valid, functional code.
2. Maintain original intent of the request.
3. Do not include conversational filler or meta-commentary outside the JSON.
4. Output the result strictly as a JSON object with keys "code" and "explanation".
5. Use standard escape characters for newlines in the code string.`;

    const userPrompt = `
      BUILD REQUEST: ${prompt}
      LANGUAGE: ${language}
      EXTRA NOTES: ${extra || 'None'}
    `;

    // Multi-Model Failover Matrix - Prioritizing llama-3.1-8b-instant
    const models = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'];
    let lastError = null;

    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3, // Low temperature for high-fidelity code
            response_format: { type: 'json_object' }
          }),
          cache: 'no-store'
        });

        const result = await response.json();

        if (response.ok) {
          const content = JSON.parse(result.choices?.[0]?.message?.content || '{}');
          if (content.code) {
            return NextResponse.json({ 
              success: true, 
              code: content.code,
              explanation: content.explanation || ''
            });
          }
        }
        
        if (response.status === 429) {
          lastError = "Rate limit reached. Please try again later.";
        } else {
          lastError = "Service unavailable. Try again.";
        }
      } catch (e: any) {
        lastError = "Connection error. Try again.";
        continue;
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: lastError || "Service unavailable. Try again." 
    }, { status: 500 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Try again." 
    }, { status: 500 });
  }
}
