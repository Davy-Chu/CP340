export function readConfig(env: NodeJS.ProcessEnv) {
  const secretKey = env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey || secretKey === 'sk_test_replace_me') {
    throw new Error('STRIPE_SECRET_KEY is missing. Set your Stripe sandbox sk_test_ key in project/.env.');
  }
  if (!secretKey.startsWith('sk_test_')) {
    throw new Error('Only Stripe sandbox keys (sk_test_) are allowed. Live payments are disabled.');
  }
  const url = new URL(env.CLIENT_URL || 'http://localhost:5173');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error('CLIENT_URL must be an HTTP(S) URL without credentials, query parameters, or a fragment.');
  }
  const port = Number(env.PORT || 4242);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }
  return { secretKey, clientUrl: url.toString().replace(/\/$/, ''), port };
}
