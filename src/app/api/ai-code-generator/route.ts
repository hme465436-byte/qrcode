import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Advanced Multi-Node Relay for AI Code Generation.
 * Failover Hierarchy: Gemini -> Groq -> OpenRouter -> Pollinations (Free).
 * Enforces strict JSON encapsulation to prevent client-side parsing errors.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, mode, extra, currentCode, instruction } = await req.json();
    
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    const groqKey = (process.env.GROQ_API_KEY || '').trim();
    const openRouterKey = (process.env.OPENROUTER_API_KEY || '').trim();

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
      const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const model of geminiModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}` }] }],
              generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
            }),
            cache: 'no-store'
          });
          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const json = JSON.parse(text);
              if (json.code) return NextResponse.json({ success: true, code: json.code, explanation: json.explanation || '' });
            }
          }
        } catch (e) { console.warn("Gemini Node restricted."); }
      }
    }

    // --- 2. Tier 2: Groq (Secondary) ---
    if (groqKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            temperature: 0.2,
            response_format: { type: 'json_object' }
          }),
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          if (content.code) return NextResponse.json({ success: true, code: content.code, explanation: content.explanation || '' });
        }
      } catch (e) { console.warn("Groq Node restricted."); }
    }

    // --- 3. Tier 3: OpenRouter (Tertiary) ---
    if (openRouterKey) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openRouterKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            response_format: { type: 'json_object' }
          }),
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          const content = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          if (content.code) return NextResponse.json({ success: true, code: content.code, explanation: content.explanation || '' });
        }
      } catch (e) { console.warn("OpenRouter Node restricted."); }
    }

    // --- 4. Tier 4: Pollinations (Emergency Fallback - Free) ---
    try {
      const response = await fetch('https://text.pollinations.ai/openai/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'openai',
          messages: [
            { role: 'system', content: systemPrompt + " You MUST return ONLY a JSON object. No markdown." },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.2
        }),
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content || '';
        // Clean markdown from free API if it ignored the system prompt
        const cleanJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const content = JSON.parse(cleanJson);
        if (content.code) return NextResponse.json({ success: true, code: content.code, explanation: content.explanation || '' });
      }
    } catch (e) { console.warn("Emergency Node restricted."); }

    return NextResponse.json({ success: false, message: "Service unavailable. Try again." }, { status: 503 });

  } catch (err: any) {
    return NextResponse.json({ success: false, message: "Service unavailable. Try again." }, { status: 500 });
  }
}
