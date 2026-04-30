import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/ranking', async (req, res) => {
    try {
      const { url, keyword } = req.body;
      if (!url || !keyword) {
        return res.status(400).json({ error: 'URL and keyword are required' });
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
      res.json(analysisData);

    } catch (error: any) {
      console.error('Ranking analysis error:', error);
      let errorMsg = 'Failed to fetch ranking';
      if (error?.message?.includes('API key not valid')) {
          errorMsg = 'API key not valid. Please configure a valid Gemini API Key.';
      }
      res.status(500).json({ error: errorMsg });
    }
  });

  app.post('/api/analyze', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
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
        return res.status(500).json({ error: `Failed to fetch website: ${e.message}` });
      }

      // 2. Parse HTML with cheerio for basic SEO metrics
      const $ = cheerio.load(html);
      
      const title = $('title').text() || '';
      const h1Count = $('h1').length;
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      const imgCount = $('img').length;
      const imgWithoutAlt = $('img:not([alt]), img[alt=""]').length;
      const linksCount = $('a').length;

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
      res.json({
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
          errorMsg = 'API key not valid. Please configure a valid Gemini API Key in the settings (or environment variable).';
      }
      
      res.status(500).json({ error: errorMsg });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
