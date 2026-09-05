
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Chatbot.
 * Accesses private API keys and performs multi-node failover.
 * Hierarchy: Gemini (Primary) -> Groq (Fallback) -> Custom.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages, config } = await req.json();

    const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    const baseSystemPrompt = `You are a helpful AI assistant for a professional studio website in Pakistan. 
    
    CRITICAL PROTOCOLS:
    1. LINGUISTIC MATCHING:
       - Match the user's language EXACTLY.
       - English input -> English output.
       - Roman Urdu input (e.g., "kya ho raha hai") -> Roman Urdu output.
       - Urdu script input -> Urdu script output.
    
    2. VOCABULARY RESTRICTION:
       - NEVER use "Namaste" or Hindi-specific words.
       - FORBIDDEN WORDS: "jaankari", "dhanyavad", "kripya", "aapka", "shukriya", "swagat", "vahan".
       - Use standard Pakistani Urdu (Assalam-o-Alaikum) or professional English equivalents.
    
    3. INTERACTION STYLE:
       - ANSWER DIRECTLY and concisely.
       - If the user says "Hello", "Hi", or "Salam", reply: "Hello, how can I help you?" or "Walaikum Assalam, how can I help you?".
       - DO NOT ask redundant questions like "Do you want information?" or "Do you have a problem?".
       - DO NOT translate the user's message back to them.
       - DO NOT provide commentary about the language being used.
       - DO NOT ask "Am I correct?".
    
    4. WRITING STANDARDS (Emails/Docs):
       - Use placeholders like [Your Name], [Date], [Reason] for missing data.
       - NEVER invent fake names or dates.
       - Maintain strict linguistic consistency.
    
    Be extremely direct, professional, and useful. Sound like a high-end digital utility.`;

    const systemPrompt = config.systemPrompt ? `${baseSystemPrompt}\n\nUSER-SPECIFIED PERSONA: ${config.systemPrompt}` : baseSystemPrompt;
    const temperature = config.temperature ?? 0.7;

    // --- 1. Custom Node Protocol ---
    if (config.node === 'custom' && config.customApi) {
      const { apiUrl, apiKey, modelName } = config.customApi;
      const trimmedKey = (apiKey || '').trim();
      if (!trimmedKey) return NextResponse.json({ success: false, message: "API Key required for private node." }, { status: 400 });

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${trimmedKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelName || 'gpt-4o-mini',
            messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
            temperature: temperature,
          }),
        });
        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({ success: true, text: data.choices[0].message.content });
        }
      } catch (e) {}
    }

    // --- 2. Primary Node: Gemini ---
    if (geminiKey) {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-3.5-flash'];
      
      // Mapper for Gemini turn-based content
      const geminiContents = messages.slice(-10).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      for (const model of geminiModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents: geminiContents,
              generationConfig: {
                temperature: temperature,
                maxOutputTokens: config.maxTokens || 2048,
              }
            }),
            cache: 'no-store'
          });

          const data = await response.json();
          if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
            return NextResponse.json({ 
              success: true, 
              text: data.candidates[0].content.parts[0].text 
            });
          }
        } catch (e) {
          continue;
        }
      }
    }

    // --- 3. Fallback Node: Groq ---
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
            messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-10)],
            temperature: temperature,
            max_tokens: config.maxTokens || 2048,
          }),
          cache: 'no-store'
        });

        const data = await response.json();
        if (response.ok && data.choices?.[0]?.message?.content) {
          return NextResponse.json({ 
            success: true, 
            text: data.choices[0].message.content 
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Please try again later." 
    }, { status: 503 });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Please try again." 
    }, { status: 500 });
  }
}
