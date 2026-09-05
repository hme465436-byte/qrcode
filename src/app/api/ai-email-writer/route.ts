
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Email Writing.
 * Connects to Groq API with multi-model failover.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { purpose, recipient, tone, extra } = await req.json();
    const apiKey = (process.env.GROQ_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Service unavailable. Node configuration missing." 
      }, { status: 503 });
    }

    const prompt = `
      Write a professional email based on the following details.
      
      PURPOSE: ${purpose}
      RECIPIENT: ${recipient}
      TONE: ${tone}
      EXTRA DETAILS: ${extra || 'None'}

      Rules:
      1. Provide a concise, relevant subject line.
      2. Format the body with clear paragraphs and a professional sign-off.
      3. Do not include any conversational filler or meta-commentary.
      4. Output the result strictly as a JSON object with keys "subject" and "body".
      5. The "body" text should use standard newlines for formatting.
    `;

    // Multi-Model Failover Matrix
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
              { role: 'system', content: 'You are an expert executive communications assistant. Output JSON only.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
          }),
          cache: 'no-store'
        });

        const result = await response.json();

        if (response.ok) {
          const content = JSON.parse(result.choices?.[0]?.message?.content || '{}');
          if (content.subject && content.body) {
            return NextResponse.json({ 
              success: true, 
              subject: content.subject,
              body: content.body
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
