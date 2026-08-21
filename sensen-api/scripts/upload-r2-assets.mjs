import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, '..', '..');
const imageRoot = path.join(root, 'site', 'assets', 'images');
const wranglerBin = path.join(root, 'sensen-api', 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const bucket = process.env.R2_BUCKET || 'sensen-images';
const concurrency = Math.max(1, Math.min(12, Number(process.env.R2_CONCURRENCY || 8)));

const mimeTypes = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const absolute = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(absolute) : [absolute];
});

const files = walk(imageRoot).filter((file) => mimeTypes[path.extname(file).toLowerCase()]);
let completed = 0;
let nextIndex = 0;

const uploadOne = async (file) => {
  const relative = path.relative(imageRoot, file).split(path.sep).join('/');
  const key = `images/${relative}`;
  const contentType = mimeTypes[path.extname(file).toLowerCase()];
  await execFileAsync(process.execPath, [wranglerBin, 'r2', 'object', 'put', `${bucket}/${key}`, '--remote', '--file', file, '--content-type', contentType, '--cache-control', 'public, max-age=31536000, immutable', '--force'], { cwd: path.join(root, 'sensen-api'), maxBuffer: 1024 * 1024 });
  completed += 1;
  if (completed === 1 || completed === files.length || completed % 25 === 0) console.log(`Uploaded ${completed}/${files.length}: ${key}`);
};

const worker = async () => {
  while (true) {
    const index = nextIndex++;
    if (index >= files.length) return;
    await uploadOne(files[index]);
  }
};

console.log(`Uploading ${files.length} image assets to ${bucket} with concurrency ${concurrency}...`);
await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
console.log(`Uploaded ${completed} image assets.`);
