import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Code Generation.
 * Accesses specialized environment keys: AI_CODE_API_1 (Gemini) and AI_CODE_API_2 (Groq).
 * Failover Hierarchy: Gemini (Primary) -> Groq (Fallback).
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, mode, extra, currentCode, instruction } = await req.json();
    
    const geminiKey = (process.env.AI_CODE_API_1 || '').trim();
    const groqKey = (process.env.AI_CODE_API_2 || '').trim();

    const isImprove = mode === 'improve';

    const systemPrompt = `You are an expert senior software engineer.
    Provide valid, clean, and professional code in ${language}.
    
    CRITICAL RULES:
    1. You MUST output your response as a valid JSON object.
    2. The JSON MUST have two keys: "code" (the actual source code) and "explanation" (a brief summary).
    3. Do NOT include markdown code blocks (like \`\`\`json) in your response. Output the JSON directly.
    4. If mode is "fix", identify the error and provide the corrected version.
    5. If mode is "improve", you will receive the CURRENT_CODE and an INSTRUCTION. Modify the code strictly following the instruction.`;

    const userPrompt = isImprove 
      ? `INSTRUCTION: ${instruction}\n\nCURRENT_CODE:\n${currentCode}`
      : `TASK: ${prompt}\nMODE: ${mode}\nLANGUAGE: ${language}\nEXTRA NOTES: ${extra || 'None'}`;

    // --- 1. Tier 1: Gemini (Primary) ---
    if (geminiKey) {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash'];
      for (const model of geminiModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}` }] }],
              generationConfig: { 
                temperature: 0.1, 
                responseMimeType: "application/json" 
              }
            }),
            cache: 'no-store'
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const json = JSON.parse(text);
              if (json.code) {
                return NextResponse.json({ ok: true, code: json.code, explanation: json.explanation || '' });
              }
            }
          }
        } catch (e) {
          console.warn(`Gemini Node [${model}] restricted.`);
        }
      }
    }

    // --- 2. Tier 2: Groq (Fallback) ---
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${groqKey}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt }, 
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          }),
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          if (content.code) {
            return NextResponse.json({ ok: true, code: content.code, explanation: content.explanation || '' });
          }
        }
      } catch (e) {
        console.warn("Groq Node restricted.");
      }
    }

    return NextResponse.json({ ok: false, error: "Try again." }, { status: 503 });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "Try again." }, { status: 500 });
  }
}
