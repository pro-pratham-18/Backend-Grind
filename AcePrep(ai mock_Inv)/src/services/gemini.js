/**
 * AI service — talks to our own Express backend instead of calling
 * OpenRouter / OpenAI directly from the browser.
 *
 * The API key lives server-side only (never bundled into the client).
 */

// Base URL of the API server.  In dev Vite proxies /api → localhost:3001,
// in production you'd set this to wherever the server is hosted.
const API_BASE = '/api';

/**
 * Model space — picked up from the backend env (OPENROUTER_MODEL).
 * Kept as an export so the UI can display it if desired.
 */
export const OPENROUTER_MODEL =
  import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/owl-alpha';

/* ──────────────────────────── helpers ──────────────────────────── */

/**
 * Robustly parse JSON out of an AI response.
 * Strips markdown fences and any surrounding prose.
 */
export const parseGeminiJSON = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty response from AI.');
  }
  let cleaned = text.trim();
  // Strip markdown fences
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  // Trim to first { or [ and last } or ]
  const firstBrace = cleaned.search(/[{[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error('AI response did not contain valid JSON.');
  }
  cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error('Failed to parse AI response as JSON.');
  }
};

/**
 * Call the backend /api/ai endpoint with a prompt, return raw text.
 */
const callAI = async (prompt) => {
  const res = await fetch(`${API_BASE}/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Server error ${res.status}`);
  }

  return data.text;
};

/**
 * Send a prompt to the backend and parse the JSON response.
 */
const generateJSON = async (prompt) => {
  try {
    const text = await callAI(prompt);
    return parseGeminiJSON(text);
  } catch (e) {
    const msg = e?.message || '';

    if (/402|quota|exceed|billing|payment/i.test(msg)) {
      throw new Error('AI request failed: quota/billing issue.');
    }
    if (/401|403|api key|unauthorized/i.test(msg)) {
      throw new Error('AI request failed: invalid API key.');
    }
    if (/429|rate limit/i.test(msg)) {
      throw new Error('AI request failed: rate limited.');
    }

    throw new Error(`AI request failed: ${msg || 'unknown error'}`);
  }
};

/* ----------------------------- INTERVIEW ----------------------------- */

export const generateInterviewQuestions = async ({ role, difficulty, count }) => {
  const prompt = `You are an expert technical interviewer. Generate exactly ${count} interview questions for a ${role} position at ${difficulty} difficulty.

Return ONLY valid JSON in this exact format (no preamble, no markdown fences, no extra text):
[
  { "id": 1, "question": "..." },
  { "id": 2, "question": "..." }
]

Rules:
- Questions must be relevant to ${role}.
- Difficulty must be ${difficulty}.
- Questions must be open-ended (not yes/no).
- Each question should stand alone.`;

  const data = await generateJSON(prompt);
  return data.map((q, i) => ({
    id: q.id ?? i + 1,
    question: q.question,
  }));
};

export const evaluateInterviewAnswer = async ({ question, answer, role, difficulty }) => {
  const prompt = `You are an expert interviewer evaluating a candidate's answer.

Role: ${role}
Difficulty: ${difficulty}
Question: ${question}
Answer: ${answer}

Evaluate on: technical accuracy (40%), clarity (30%), depth (30%).

Return ONLY valid JSON (no preamble, no markdown fences):
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentence constructive feedback>"
}`;

  const data = await generateJSON(prompt);
  return {
    score: Math.max(0, Math.min(10, parseInt(data.score, 10) || 0)),
    feedback: data.feedback || 'No feedback provided.',
  };
};

/* ------------------------------- TEST -------------------------------- */

export const generateTestQuestions = async ({ domain, paperType, count }) => {
  let prompt;
  if (paperType === 'mcq') {
    prompt = `Generate exactly ${count} multiple-choice questions about ${domain}.
Each question must have exactly 4 options (A, B, C, D).

Return ONLY valid JSON (no preamble, no markdown fences):
[
  {
    "id": 1,
    "question": "...",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": "<the full text of the correct option>"
  }
]`;
  } else if (paperType === 'one-word') {
    prompt = `Generate exactly ${count} one-word-answer questions about ${domain}.
The answer should be a single word or a very short phrase (max 3 words).

Return ONLY valid JSON (no preamble, no markdown fences):
[
  {
    "id": 1,
    "question": "...",
    "correctAnswer": "<the exact short answer>"
  }
]`;
  } else {
    prompt = `Generate exactly ${count} long-answer questions about ${domain}.
These should require detailed, multi-sentence explanations.

Return ONLY valid JSON (no preamble, no markdown fences):
[
  {
    "id": 1,
    "question": "..."
  }
]`;
  }

  const data = await generateJSON(prompt);
  return data.map((q, i) => ({
    id: q.id ?? i + 1,
    question: q.question, 
    options: q.options || null,
    correctAnswer: q.correctAnswer || null,
    maxScore: paperType === 'long-answer' ? 10 : 1,
  }));
};

export const evaluateTestAnswer = async ({ question, userAnswer, correctAnswer, paperType }) => {
  if (paperType === 'mcq') {
    const isCorrect =
      userAnswer && correctAnswer && userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    return {
      score: isCorrect ? 1 : 0,
      maxScore: 1,
      feedback: isCorrect
        ? 'Correct!'
        : `Incorrect. The correct answer is: ${correctAnswer}`,
      correctAnswer,
    };
  }

  if (paperType === 'one-word') {
    const prompt = `Question: ${question}
User Answer: ${userAnswer}
Expected Answer: ${correctAnswer}

Accept semantically equivalent answers (case-insensitive, minor spelling variations, synonyms).

Return ONLY valid JSON (no preamble, no markdown fences):
{
  "score": <0 or 1>,
  "maxScore": 1,
  "feedback": "<brief note>"
}`;
    const data = await generateJSON(prompt);
    return {
      score: data.score ? 1 : 0,
      maxScore: 1,
      feedback: data.feedback || (data.score ? 'Correct!' : `Expected: ${correctAnswer}`),
      correctAnswer,
    };
  }

  // long-answer
  const prompt = `You are an expert evaluator. Score the following long answer.

Question: ${question}
Answer: ${userAnswer}

Score 0-10 based on: accuracy (40%), completeness (30%), clarity (30%).

Return ONLY valid JSON (no preamble, no markdown fences):
{
  "score": <integer 0-10>,
  "maxScore": 10,
  "feedback": "<2-3 sentence constructive feedback>"
}`;
  const data = await generateJSON(prompt);
  return {
    score: Math.max(0, Math.min(10, parseInt(data.score, 10) || 0)),
    maxScore: 10,
    feedback: data.feedback || 'No feedback provided.',
  };
};

/* ---------------------------- ANALYSIS ------------------------------- */

export const generatePerformanceAnalysis = async ({ results, type }) => {
  const prompt = `You are an AI performance analyst. Analyze the following ${type} results and provide actionable insights.

Results: ${JSON.stringify(results)}

Return ONLY valid JSON (no preamble, no markdown fences):
{
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improvementSuggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;

  const data = await generateJSON(prompt);
  return {
    strengths: Array.isArray(data.strengths) ? data.strengths : [],
    weaknesses: Array.isArray(data.weaknesses) ? data.weaknesses : [],
    improvementSuggestions: Array.isArray(data.improvementSuggestions) ? data.improvementSuggestions : [],
  };
};
