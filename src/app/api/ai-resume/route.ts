import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Secure Server Node for AI Resume Synthesis.
 * Handles complex professional profiles with tone and length parameters.
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { data, options } = await req.json();
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
      
      PERSONAL IDENTITY:
      - NAME: ${data.name}
      - EMAIL: ${data.email}
      - PHONE: ${data.phone}
      - CURRENT TITLE: ${data.title}
      
      EXPERIENCE MATRIX:
      - SKILLS: ${data.skills}
      - WORK HISTORY: ${data.experience}
      - EDUCATION: ${data.education}
      - PROJECTS: ${data.projects || 'None provided'}
      - LANGUAGES: ${data.languages || 'None provided'}
      
      TARGETING & STYLE:
      - TARGET ROLE: ${data.target || 'Professional Growth'}
      - TONE: ${options.tone || 'Professional'} (Ensure the language reflects this tone)
      - LENGTH: ${options.length || 'Detailed'} (Adjust the depth of bullet points accordingly)

      Rules:
      1. Use a standard executive structure: Summary, Skills, Experience, Projects (if provided), Education, and Languages.
      2. Use action verbs and quantifiable results for all bullet points.
      3. Format with clear headings and readable spacing.
      4. Avoid conversational filler or meta-commentary.
      5. Output ONLY the resume text.
    `;

    // Model Failover Matrix
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
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
              maxOutputTokens: 3000,
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
