import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Code Generation.
 * Multi-node failover: Gemini (Primary 2.5/2.0/3.5) -> Groq (Fallback 3.1).
 * Ensures output is ALWAYS a valid JSON object to prevent client-side parsing errors.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, language, mode, extra, currentCode, instruction } = await req.json();
    
    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    if (!geminiKey && !groqKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Service unavailable. Try again." 
      }, { status: 503 });
    }

    const isImprove = mode === 'improve';

    const systemPrompt = `You are an expert senior software engineer and architect. 
    Provide valid, clean, and professional code in ${language}.
    
    CRITICAL RULES:
    1. You MUST output your response as a valid JSON object.
    2. The JSON MUST have two keys: "code" (the actual source code) and "explanation" (a brief summary).
    3. Do NOT include markdown code blocks (like \`\`\`json) outside or inside the JSON string.
    4. If the user asks for HTML, put the HTML string inside the "code" field.
    5. Maintain original intent of the request.
    6. If mode is "fix", identify the error and provide the corrected version.
    7. If mode is "improve", you will receive the CURRENT_CODE and an INSTRUCTION. Modify the code strictly following the instruction.`;

    const userPrompt = isImprove 
      ? `INSTRUCTION: ${instruction}\n\nCURRENT_CODE:\n${currentCode}`
      : `TASK: ${prompt}\nMODE: ${mode}\nLANGUAGE: ${language}\nEXTRA NOTES: ${extra || 'None'}`;

    // --- 1. Primary Node Cluster: Gemini ---
    if (geminiKey) {
      // User specified models + 1.5-flash as the most reliable current production fallback
      const geminiModels = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      
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

          if (!response.ok) continue;

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
              continue; // Try next model if JSON parsing failed
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
            temperature: 0.2,
            response_format: { type: 'json_object' }
          }),
          cache: 'no-store'
        });

        if (response.ok) {
          const data = await response.json();
          const contentStr = data.choices?.[0]?.message?.content;
          if (contentStr) {
            const content = JSON.parse(contentStr);
            if (content.code) {
              return NextResponse.json({ 
                success: true, 
                code: content.code,
                explanation: content.explanation || ''
              });
            }
          }
        }
      } catch (e) {}
    }

    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Try again." 
    }, { status: 503 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Try again." 
    }, { status: 500 });
  }
}
