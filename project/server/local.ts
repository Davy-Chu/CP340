import { readConfig } from './config.js';

try {
  // index loads dotenv once and exports the same app that Vercel invokes.
  const { default: app } = await import('./index.js');
  const { port } = readConfig(process.env);
  app.listen(port, () => {
    console.log(`WorkNest sandbox checkout server: http://localhost:${port}`);
  }).on('error', (error) => {
    console.error('Could not start the checkout server:', error.message);
    process.exitCode = 1;
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Could not configure checkout.');
  process.exitCode = 1;
}
