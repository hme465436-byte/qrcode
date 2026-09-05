import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Code Generation.
 * Detects key types and routes to appropriate high-fidelity nodes.
 * Support for Custom API nodes (OpenAI compatible).
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

async function tryOpenAICompatible(url: string, key: string, model: string, systemPrompt: string, userPrompt: string) {
  try {
    const response = await fetch(url, {
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
    }
    return { success: false, error: data.error?.message || `Node Error: ${response.status}` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, mode, extra, currentCode, instruction, customApi } = await req.json();
    
    const systemPrompt = `You are an expert senior software engineer.
    Provide valid, clean, and professional code in ${language}.
    
    CRITICAL RULES:
    1. You MUST output your response as a valid JSON object.
    2. The JSON MUST have two keys: "code" (the actual source code) and "explanation" (a brief summary).
    3. Do NOT include markdown code blocks (like \`\`\`json) in your response. Output the JSON directly.
    4. If mode is "fix", identify the error and provide the corrected version.
    5. If mode is "improve", you will receive the CURRENT_CODE and an INSTRUCTION. Modify the code strictly following the instruction.`;

    const userPrompt = mode === 'improve'
      ? `INSTRUCTION: ${instruction}\n\nCURRENT_CODE:\n${currentCode}`
      : `TASK: ${prompt}\nMODE: ${mode}\nLANGUAGE: ${language}\nEXTRA NOTES: ${extra || 'None'}`;

    // --- 1. Custom Node Execution ---
    if (customApi && customApi.key) {
      const key = customApi.key.trim();
      let url = customApi.url?.trim();
      let model = customApi.model?.trim();

      // Auto-detection logic for missing URL/Model
      if (key.startsWith('gsk_')) {
        url = url || 'https://api.groq.com/openai/v1/chat/completions';
        model = model || 'llama-3.1-8b-instant';
      } else if (key.startsWith('sk-or-')) {
        url = url || 'https://openrouter.ai/api/v1/chat/completions';
        model = model || 'meta-llama/llama-3.1-8b-instruct';
      } else if (key.startsWith('AQ.') || key.startsWith('AIza')) {
        const res = await tryGemini(key, systemPrompt, userPrompt);
        if (res.success) return NextResponse.json({ ok: true, ...res });
      }

      // If we have a URL and it's not Gemini, try OpenAI-compatible
      if (url && model) {
        const res = await tryOpenAICompatible(url, key, model, systemPrompt, userPrompt);
        if (res.success) return NextResponse.json({ ok: true, ...res });
      }
    }

    // --- 2. Internal Failover (Fallback) ---
    const key1 = (process.env.AI_CODE_API_1 || '').trim();
    const key2 = (process.env.AI_CODE_API_2 || '').trim();
    const keys = [key1, key2].filter(Boolean);
    
    let finalError = 'No active node identified.';

    for (const key of keys) {
      const isGemini = key.startsWith('AQ.') || key.startsWith('AIza');
      const isGroq = key.startsWith('gsk_');

      if (isGemini) {
        const res = await tryGemini(key, systemPrompt, userPrompt);
        if (res.success) return NextResponse.json({ ok: true, ...res });
        finalError = res.error!;
      } else if (isGroq) {
        const res = await tryOpenAICompatible('https://api.groq.com/openai/v1/chat/completions', key, 'llama-3.1-8b-instant', systemPrompt, userPrompt);
        if (res.success) return NextResponse.json({ ok: true, ...res });
        finalError = res.error!;
      }
    }

    return NextResponse.json({ ok: false, error: finalError });

  } catch (err: any) {
    return NextResponse.json({ ok: false, error: "Protocol Error: " + err.message });
  }
}
