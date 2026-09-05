
import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Resume Synthesis.
 * Accesses private API keys to interface with Gemini.
 * Sanitizes output to provide clean, professional text structures.
 * Implements multi-model failover for protocol stability.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: "Service unavailable. Try again." 
      }, { status: 503 });
    }

    const prompt = `
      You are a professional executive resume writer. 
      Generate a clean, professional, and impact-oriented resume based on the following identity matrix.
      
      NAME: ${data.name}
      EMAIL: ${data.email}
      PHONE: ${data.phone}
      TITLE: ${data.title}
      SKILLS: ${data.skills}
      EXPERIENCE: ${data.experience}
      EDUCATION: ${data.education}
      TARGET ROLE: ${data.target || 'Professional Growth'}

      Rules:
      1. Use a standard professional structure (Summary, Experience, Skills, Education).
      2. Use bullet points for achievements.
      3. Focus on action verbs and quantifiable results.
      4. Ensure the layout is clean for a text-based or print-friendly document.
      5. Output ONLY the resume text without any conversational filler or meta-commentary.
    `;

    // Model Failover Matrix
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.5-flash', 'gemini-3.8-flash'];
    
    for (const model of models) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

          if (generatedText) {
            return NextResponse.json({ 
              success: true, 
              text: generatedText 
            });
          }
        }
      } catch (e) {
        // Continue to next model in matrix
        continue;
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Try again." 
    }, { status: 500 });

  } catch (err: any) {
    console.error('Resume Synthesis Error:', err);
    return NextResponse.json({ 
      success: false, 
      message: "Service unavailable. Try again." 
    }, { status: 500 });
  }
}
