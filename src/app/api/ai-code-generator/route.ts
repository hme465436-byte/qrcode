
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Code Generation.
 * Multi-node failover: Gemini (Primary) -> Groq (Fallback).
 * Supports specialized modes: New Code, Fix Logic, and Technical Explanation.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, mode, extra } = await req.json();
    
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    if (!geminiKey && !groqKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Node configuration missing. Please check server environment." 
      }, { status: 503 });
    }

    const systemPrompt = `You are an expert senior software engineer and architect. 
    Provide valid, clean, and professional code in ${language}.
    
    Current Mode: ${mode || 'new'}
    
    Rules:
    1. Output strictly as a JSON object with keys "code" and "explanation".
    2. The "code" value should be the actual source code as a string.
    3. The "explanation" should be a short summary of the logic and implementation strategy.
    4. Do not include markdown code blocks (like \`\`\`json) in the response text.
    5. Maintain original intent of the request.
    6. If mode is "fix", identify the error and provide the corrected version.
    7. If mode is "explain", provide the code but prioritize a detailed breakdown in the explanation field.`;

    const userPrompt = `
      TASK: ${prompt}
      MODE: ${mode}
      LANGUAGE: ${language}
      EXTRA NOTES: ${extra || 'None'}
    `;

    // --- 1. Primary Node: Gemini Matrix ---
    if (geminiKey) {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.5-flash'];
      
      for (const model of geminiModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}` }] }],
              generationConfig: {
                temperature: 0.2, // Low temp for precise code
                responseMimeType: "application/json"
              }
            }),
            cache: 'no-store'
          });

          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (text) {
            try {
              const json = JSON.parse(text);
              if (json.code) {
                return NextResponse.json({ 
                  success: true, 
                  code: json.code, 
                  explanation: json.explanation || '' 
                });
              }
            } catch (e) {
              if (text.length > 20) {
                 return NextResponse.json({ success: true, code: text, explanation: 'Direct response generated.' });
              }
            }
          }
        } catch (e) {
          continue; 
        }
      }
    }

    // --- 2. Fallback Node: Groq Matrix ---
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' }
          }),
          cache: 'no-store'
        });

        const data = await response.json();
        const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
        
        if (content.code) {
          return NextResponse.json({ 
            success: true, 
            code: content.code,
            explanation: content.explanation || ''
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. All discovery nodes restricted. Try again." 
    }, { status: 503 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "An error occurred during code synthesis. Try again." 
    }, { status: 500 });
  }
}
