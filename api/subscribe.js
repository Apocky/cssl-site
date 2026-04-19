const fs = require('fs');

const STORE = '/tmp/cssl-subscribers.json';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function load() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); }
  catch { return { subscribers: [] }; }
}

function save(data) {
  fs.writeFileSync(STORE, JSON.stringify(data, null, 2));
}

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const email = (typeof body.email === 'string' ? body.email : '').trim().toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const store = load();

  if (store.subscribers.includes(email)) {
    return res.status(200).json({ ok: true, already: true });
  }

  store.subscribers.push(email);
  save(store);

  console.log(`[subscribe] +${email} (total: ${store.subscribers.length})`);

  return res.status(200).json({ ok: true });
};
