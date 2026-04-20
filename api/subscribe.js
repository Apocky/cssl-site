// TODO: Add rate limiting (e.g. Vercel Edge Config + KV, or Upstash Redis)
// to prevent abuse — recommend 5 requests per IP per hour.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ORIGINS = new Set(['https://cssl.dev', 'https://www.cssl.dev']);

function checkOrigin(req) {
  const origin = req.headers['origin'] || '';
  if (origin) return ALLOWED_ORIGINS.has(origin);
  const referer = req.headers['referer'] || '';
  try {
    return ALLOWED_ORIGINS.has(new URL(referer).origin);
  } catch { return false; }
}

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!checkOrigin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const body = req.body || {};
  const email = (typeof body.email === 'string' ? body.email : '').trim().toLowerCase();

  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  // Intent logged; actual storage must be handled by a backend service
  // (not /tmp — ephemeral on Vercel, lost on cold start).
  console.log('[subscribe] signup intent received');

  return res.status(200).json({ ok: true });
};
