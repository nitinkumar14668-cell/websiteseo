import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure URL has http/https
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    // 1. Fetch the website HTML
    let html = '';
    let loadTime = 0;
    try {
      const start = Date.now();
      const response = await axios.get(targetUrl, { timeout: 10000 });
      html = response.data;
      loadTime = Date.now() - start;
    } catch (e: any) {
      return NextResponse.json({ error: `Failed to fetch website: ${e.message}` }, { status: 500 });
    }

    // 2. Parse HTML with cheerio for basic SEO metrics
    const $ = cheerio.load(html);
    
    const title = $('title').text() || '';
    const h1Count = $('h1').length;
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const imgCount = $('img').length;
    const imgWithoutAlt = $('img:not([alt]), img[alt=""]').length;

    // Extract text content for AI to analyze (limit to first 10000 chars to avoid token limits)
    const textContent = $('body').text().replace(/\s+/g, ' ').substring(0, 5000);

    // 3. Send to Gemini for advanced analysis
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY ? { apiKey: process.env.GEMINI_API_KEY } : {});
    
    const prompt = `
      Analyze the SEO of this website URL: ${targetUrl}
      
      Technical metrics collected:
      - Title: ${title}
      - Meta Description: ${metaDescription}
      - H1 Tag Count: ${h1Count}
      - Images without Alt Text: ${imgWithoutAlt} out of ${imgCount} total
      - Load Time: ${loadTime}ms
      
      Text Content Sample:
      ${textContent}
      
      Provide a comprehensive SEO report in Hindi language (written in English script / Hinglish). Respond strictly in JSON format with the following structure:
      {
        "score": number (0 to 100),
        "summary": "overall summary in Hindi",
        "strengths": ["array of good things in Hindi"],
        "errors": [
          {
            "issue": "description of the issue in Hindi",
            "impact": "High | Medium | Low",
            "solution": "how to fix it in Hindi"
          }
        ],
        "estimatedRankingMetrics": {
          "keywordDensity": "poor | average | good",
          "contentQuality": "poor | average | good"
        }
      }
      
      Make sure the response is ONLY valid JSON. No markdown formatting around it.
    `;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const aiDataText = aiResponse.text;
    if (!aiDataText) {
        throw new Error("No response from AI");
    }
    
    const analysisData = JSON.parse(aiDataText);

    // Return combined data
    return NextResponse.json({
      rawMetrics: {
        title,
        metaDescription,
        h1Count,
        imgCount,
        imgWithoutAlt,
        loadTime
      },
      aiAnalysis: analysisData
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    let errorMsg = 'Failed to analyze SEO';
    if (error?.message?.includes('API key not valid')) {
        errorMsg = 'API key not valid. Please configure a valid Gemini API Key.';
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
