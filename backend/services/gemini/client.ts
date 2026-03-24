import crypto from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_SECRET = process.env.GEMINI_API_SECRET || '';
const GEMINI_API_URL = process.env.GEMINI_API_URL || 'https://api.sandbox.gemini.com';

function makeAuthHeaders(requestPath: string, body: Record<string, unknown> = {}) {
  const nonce = Math.floor(Date.now() / 1000);
  const payload = {
    request: requestPath,
    nonce,
    ...body,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha384', GEMINI_API_SECRET).update(payloadB64).digest('hex');

  return {
    'Content-Length': '0',
    'Content-Type': 'text/plain',
    'X-GEMINI-APIKEY': GEMINI_API_KEY,
    'X-GEMINI-PAYLOAD': payloadB64,
    'X-GEMINI-SIGNATURE': signature,
    'Cache-Control': 'no-cache',
  };
}

/**
 * Make a GET request to a public Gemini endpoint.
 */
export async function geminiGet<T>(path: string, params?: Record<string, string | string[]>): Promise<T> {
  const url = new URL(path, GEMINI_API_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          url.searchParams.append(key, v);
        }
      } else {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Cache-Control': 'no-cache' },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new GeminiApiError(res.status, `Gemini GET ${path} failed: ${res.status} ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Make an authenticated POST request to a private Gemini endpoint.
 */
export async function geminiPost<T>(path: string, body: Record<string, unknown> = {}): Promise<T> {
  if (!GEMINI_API_KEY || !GEMINI_API_SECRET) {
    throw new GeminiApiError(401, 'Gemini API credentials not configured. Set GEMINI_API_KEY and GEMINI_API_SECRET.');
  }

  const headers = makeAuthHeaders(path, body);
  const url = `${GEMINI_API_URL}${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new GeminiApiError(res.status, `Gemini POST ${path} failed: ${res.status} ${errorBody}`);
  }

  return res.json() as Promise<T>;
}

export class GeminiApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

/**
 * Check if Gemini API credentials are configured.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY && GEMINI_API_SECRET);
}
