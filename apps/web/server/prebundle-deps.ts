import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeDeps, resolveConfig } from 'vite';

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// server.ts may have exited while the imports loaded, before the listener below existed.
if (process.send && !process.connected) {
	process.exit(1);
}

process.once('disconnect', () => process.exit(1));

// Silences the deprecation notice of optimizeDeps; the log level is not part of the cache key.
const config = await resolveConfig({ root: appDirectory, logLevel: 'error' }, 'serve');

await optimizeDeps(config);

// The config's plugins keep handles open, so the process would not exit on its own.
process.exit(0);
