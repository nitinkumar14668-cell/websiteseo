import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { url, keyword } = await req.json();
    if (!url || !keyword) {
      return NextResponse.json({ error: 'URL and keyword are required' }, { status: 400 });
    }

    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {});
    
    const prompt = `
      Check the estimated SEO ranking for the website: ${url}
      For the keyword: "${keyword}"
      
      Using Google Search, provide an estimate of how well this website ranks for this keyword, its domain authority, and industry presence.
      
      Respond strictly in JSON format with the following structure:
      {
        "rank": "number as string or '100+' if not in top",
        "estimatedTraffic": "estimated monthly traffic string (e.g. '10K-50K')",
        "difficulty": "High | Medium | Low",
        "competitors": ["competitor 1", "competitor 2", "competitor 3"],
        "summary": "Short analysis in Hindi (written in English script / Hinglish)"
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    const aiDataText = aiResponse.text;
    if (!aiDataText) {
        throw new Error("No response from AI");
    }
    
    const analysisData = JSON.parse(aiDataText);
    return NextResponse.json(analysisData);

  } catch (error: any) {
    console.error('Ranking analysis error:', error);
    let errorMsg = 'Failed to fetch ranking';
    if (error?.message?.includes('API key not valid')) {
        errorMsg = 'API key not valid. Please configure a valid Gemini API Key.';
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
