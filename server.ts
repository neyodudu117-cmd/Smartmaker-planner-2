import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import apiApp from './api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  console.log("SERVER GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "EXISTS" : "UNDEFINED");

  // Mount API routes
  app.use(apiApp);

  app.get('/api/env-check', (req, res) => {
    res.json({
      gemini: process.env.GEMINI_API_KEY ? 'exists' : 'undefined',
      api: process.env.API_KEY ? 'exists' : 'undefined',
      allKeys: Object.keys(process.env).filter(k => k.includes('API') || k.includes('GEMINI'))
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
