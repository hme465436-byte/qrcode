import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Code Generation.
 * Smart detection for Gemini (AQ./AIza) and Groq (gsk_) keys.
 * Implements high-fidelity failover hierarchy.
 */

export const dynamic = 'force-dynamic';

async function tryGemini(key: string, systemPrompt: string, userPrompt: string) {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash'];
  let lastErr = 'Gemini Node restricted';
  
  for (const model of models) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
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

      const data = await response.json();
      if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            const json = JSON.parse(text);
            if (json.code) return { success: true, code: json.code, explanation: json.explanation || '' };
          } catch (e) {
            // Fallback for raw text if JSON keys aren't perfect but code is there
            if (text.length > 10) return { success: true, code: text, explanation: '' };
          }
        }
      } else {
        lastErr = data.error?.message || `Gemini ${model} Error: ${response.status}`;
      }
    } catch (e: any) {
      lastErr = e.message;
    }
  }
  return { success: false, error: lastErr };
}

async function tryGroq(key: string, systemPrompt: string, userPrompt: string) {
  const models = ['llama-3.1-8b-instant', 'openai/gpt-oss-20b'];
  let lastErr = 'Groq Node restricted';

  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${key}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt }, 
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
        cache: 'no-store'
      });

      const data = await response.json();
      if (response.ok) {
        const contentStr = data.choices?.[0]?.message?.content;
        if (contentStr) {
          const content = JSON.parse(contentStr);
          if (content.code) return { success: true, code: content.code, explanation: content.explanation || '' };
        }
      } else {
        lastErr = data.error?.message || `Groq ${model} Error: ${response.status}`;
      }
    } catch (e: any) {
      lastErr = e.message;
    }
  }
  return { success: false, error: lastErr };
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, mode, extra, currentCode, instruction } = await req.json();
    
    const key1 = (process.env.AI_CODE_API_1 || '').trim();
    const key2 = (process.env.AI_CODE_API_2 || '').trim();

    if (!key1 && !key2) {
      return NextResponse.json({ ok: false, error: "Key missing" });
    }

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

    const keys = [key1, key2].filter(Boolean);
    let finalError = 'Model failed';

    for (const key of keys) {
      const isGemini = key.startsWith('AQ.') || key.startsWith('AIza');
      const isGroq = key.startsWith('gsk_');

      if (isGemini) {
        const res = await tryGemini(key, systemPrompt, userPrompt);
        if (res.success) return NextResponse.json({ ok: true, ...res });
        finalError = res.error!;
      } else if (isGroq) {
        const res = await tryGroq(key, systemPrompt, userPrompt);
        if (res.success) return NextResponse.json({ ok: true, ...res });
        finalError = res.error!;
      }
    }

    return NextResponse.json({ ok: false, error: finalError });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "Protocol Error: " + err.message });
  }
}
