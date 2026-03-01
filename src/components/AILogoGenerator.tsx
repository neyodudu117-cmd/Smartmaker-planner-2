import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Wand2, Loader2, Download, X } from 'lucide-react';

export default function AILogoGenerator({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('A modern, sleek logo for a financial tracking app called SmartMaker Hub. Blue and white color scheme, minimalist, professional, high quality.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  React.useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore - window.aistudio is global
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        // Fallback for environments where aistudio is not available
        setHasApiKey(true);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success as per guidelines
    }
  };

  const handleGenerate = async () => {
    if (!hasApiKey) {
      setError("Please select an API key first.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      // @ts-ignore - Vite handles process.env replacement
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
          }
        }
      });

      let foundImage = false;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
            setGeneratedImage(imageUrl);
            foundImage = true;
            break;
          }
        }
      }

      if (!foundImage) {
        setError("No image was returned by the model.");
      }
    } catch (err: any) {
      console.error("Failed to generate image:", err);
      setError(err.message || "An error occurred while generating the image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Wand2 className="w-5 h-5 text-blue-600" />
            Generate AI Logo
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="Describe the logo you want..."
            />
          </div>

          {!hasApiKey && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-3">
              <p className="text-xs text-amber-800 font-medium">
                To use the high-quality Nana Banana model, you must select a paid API key from a Google Cloud project.
              </p>
              <button 
                onClick={handleOpenKeySelector}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
              >
                Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center text-[10px] text-amber-600 hover:underline font-medium"
              >
                Learn about billing
              </a>
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !hasApiKey}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate with Nana Banana
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {generatedImage && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Result</h3>
              <div className="aspect-square w-full max-w-[256px] mx-auto bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <img src={generatedImage} alt="Generated Logo" className="w-full h-full object-cover" />
              </div>
              <a 
                href={generatedImage}
                download="smartmaker-logo.png"
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5" />
                Download Image
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
