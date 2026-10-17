import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';

type ApiRequest = IncomingMessage & { body?: unknown };
type ExerciseSuggestion = {
  name: string; category: string; difficulty: number;
  primary_muscles: string[]; cues: string[]; youtube_search: string; youtube_url: string;
};
const json = (res: ServerResponse, status: number, body: object) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
};
const validCategories = new Set(['Push', 'Pull', 'Legs', 'Core', 'Skills', 'Mobility', 'Rings', 'Yoga', 'Flexibility']);
const exerciseShape = {
  type: 'object', additionalProperties: false,
  properties: {
    name: { type: 'string' },
    category: { type: 'string', enum: [...validCategories] },
    difficulty: { type: 'integer' },
    primary_muscles: { type: 'array', items: { type: 'string' } },
    cues: { type: 'array', items: { type: 'string' } },
    youtube_search: { type: 'string' },
    youtube_url: { type: 'string' },
  },
  required: ['name', 'category', 'difficulty', 'primary_muscles', 'cues', 'youtube_search', 'youtube_url'],
};

async function readBody(req: ApiRequest): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') return JSON.parse(req.body);
    return req.body;
  }
  let text = '';
  for await (const chunk of req) {
    text += chunk.toString();
    if (text.length > 4096) throw new Error('Request exceeds 4 KB');
  }
  return JSON.parse(text);
}

export default async function handler(req: ApiRequest, res: ServerResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST required' });
  const key = process.env.OPENAI_API_KEY;
  const backendUrl = process.env.SUPABASE_URL;
  const backendPublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!key || !backendUrl || !backendPublishableKey) {
    return json(res, 503, { error: 'AI is not configured. Set server-side OpenAI and Supabase environment variables.' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
  if (!token || token.length > 5000) return json(res, 401, { error: 'Sign in to use the AI coach' });

  let body: unknown;
  try { body = await readBody(req); }
  catch { return json(res, 400, { error: 'Invalid request body' }); }

  const query = typeof body === 'object' && body !== null && 'query' in body
    ? (body as { query: unknown }).query : undefined;
  if (typeof query !== 'string' || !query.trim() || query.length > 1000) {
    return json(res, 400, { error: 'Use a prompt of 1–1,000 characters' });
  }

  try {
    const supabase = createClient(backendUrl, backendPublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: session, error: authError } = await supabase.auth.getUser(token);
    if (authError || !session.user) return json(res, 401, { error: 'Please sign in again' });

    // Postgres owns the atomic per-user daily quota; it cannot be bypassed from the browser.
    const { data: quotaAllowed, error: quotaError } = await supabase.rpc('consume_ai_request');
    if (quotaError) {
      console.error('AI quota validation failed:', quotaError.message);
      return json(res, 503, { error: 'AI quota service is not ready; apply the independent-platform migration' });
    }
    if (!quotaAllowed) return json(res, 429, { error: 'Daily coach limit reached. Try again tomorrow.' });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-5-mini',
        store: false,
        max_completion_tokens: 1600,
        messages: [
          {
            role: 'system',
            content: 'You are POWER Coach, a skilled calisthenics and fitness assistant. Give practical, precise, safe and beginner-friendly training advice. Do not claim to diagnose or treat injuries. Respond as JSON. If the person asks for exercises, include 1–4 realistic exercises with correct training categories, difficulty 1–5, concise coaching cues, and YouTube search terms. Do not invent direct YouTube video links: leave youtube_url empty unless verified. If they ask about something unrelated, answer concisely and return no exercises.',
          },
          { role: 'user', content: query.trim() },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'power_coach_result',
            strict: true,
            schema: {
              type: 'object', additionalProperties: false,
              properties: {
                message: { type: 'string' },
                exercises: { type: 'array', items: exerciseShape },
              },
              required: ['message', 'exercises'],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      // Never forward vendor internals or secret-bearing error payloads.
      console.error('AI provider status:', response.status);
      return json(res, response.status === 429 ? 429 : 502, { error: response.status === 429 ? 'AI is temporarily busy' : 'AI coach is temporarily unavailable' });
    }
    const result = await response.json() as {
      choices?: { message?: { content?: string } }[];
    };
    const payload = JSON.parse(result.choices?.[0]?.message?.content || '{}') as {
      message?: unknown; exercises?: unknown;
    };
    if (typeof payload.message !== 'string') throw new Error('Malformed model response');
    const suggestions = Array.isArray(payload.exercises) ? payload.exercises : [];
    const exercises = suggestions.slice(0, 4).filter((item): item is ExerciseSuggestion =>
      typeof item === 'object' && item !== null && typeof item.name === 'string' &&
      validCategories.has(item.category) && Number.isInteger(item.difficulty) &&
      item.difficulty >= 1 && item.difficulty <= 5 && Array.isArray(item.primary_muscles) &&
      Array.isArray(item.cues) && typeof item.youtube_search === 'string'
    ).map(item => ({
      ...item,
      youtube_url: /^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(item.youtube_url || '') ? item.youtube_url : '',
      primary_muscles: item.primary_muscles.slice(0, 5),
      cues: item.cues.slice(0, 5),
    }));
    return json(res, 200, { message: payload.message.slice(0, 5000), exercises });
  } catch (error) {
    console.error('Coach request failure:', error instanceof Error ? error.name : 'Unknown');
    return json(res, 502, { error: 'Coach could not complete the request. Please try again.' });
  }
}
