import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── OpenRouter / OpenAI client (server-side only) ──────────────────
const API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

const client = API_KEY
  ? new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AcePrep',
      },
    })
  : null;

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: MODEL, keyConfigured: !!API_KEY });
});

// ── Root endpoint ───────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ name: 'AcePrep API', status: 'ok' });
});

// ── AI proxy endpoint ───────────────────────────────────────────────
// The frontend POSTs { prompt } here so the API key never leaves the server.
app.post('/api/ai', async (req, res) => {
  if (!client) {
    return res.status(503).json({
      error: 'Server API key is not configured. Set OPENROUTER_API_KEY in .env.',
    });
  }

  const { prompt, model } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "prompt" in request body.' });
  }

  try {
    const result = await client.chat.completions.create({
      model: model || MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert technical interviewer and evaluator. Always respond with valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const text = result.choices[0].message.content;
    return res.json({ text });
  } catch (e) {
    const msg = e?.message || '';

    if (/402|quota|exceed|billing|payment/i.test(msg)) {
      return res.status(402).json({ error: 'AI request failed: quota/billing issue.' });
    }
    if (/401|403|api key|unauthorized/i.test(msg)) {
      return res.status(401).json({ error: 'AI request failed: invalid API key.' });
    }
    if (/429|rate limit/i.test(msg)) {
      return res.status(429).json({ error: 'AI request failed: rate limited.' });
    }

    console.error('[/api/ai] OpenAI error:', msg);
    return res.status(500).json({ error: `AI request failed: ${msg || 'unknown error'}` });
  }
});

// ── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`AcePrep API server running on http://localhost:${PORT}`);
  console.log(`  Model : ${MODEL}`);
  console.log(`  Key   : ${API_KEY ? '✔ configured' : '✘ MISSING — set OPENROUTER_API_KEY'}`);
});
