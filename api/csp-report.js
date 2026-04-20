// TODO (style-src): Migrate vercel.json CSP from 'unsafe-inline' to per-rule
// SHA-256 hashes or a nonce-based approach. Requires auditing all inline style
// attributes and <style> blocks, then generating hashes via build step.
// See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/style-src

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  // Consume body to avoid connection stall on some runtimes
  res.status(204).end();
};
