import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

async function generate() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: 'A modern, sleek logo for a financial tracking app called SmartMaker Hub. Blue and white color scheme, minimalist, professional, high quality.',
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64Data = part.inlineData.data;
      fs.writeFileSync('public/generated-logo.png', Buffer.from(base64Data, 'base64'));
      console.log('Successfully generated public/generated-logo.png');
    }
  }
}

generate().catch(console.error);
