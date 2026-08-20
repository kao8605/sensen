const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const frontendPort = process.env.FRONTEND_PORT || process.env.PORT || '3000';
const backendPort = process.env.BACKEND_PORT || process.env.API_PORT || '8081';
const frontendEnv = { ...process.env, PORT: frontendPort, API_PORT: backendPort };
const backendEnv = { ...process.env, PORT: backendPort, FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || `http://127.0.0.1:${frontendPort}` };
let shuttingDown = false;
const processes = [
  ['前端', 'frontend/server.js', frontendEnv],
  ['後端', 'sensen-backend/server.js', backendEnv]
].map(([label, script, env]) => {
  const child = spawn(process.execPath, [path.join(root, script)], {
    cwd: root,
    env,
    stdio: 'inherit'
  });
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.error(`${label}服務已停止（${signal || code}）。`);
      shutdown(code || 1);
    }
  });
  return child;
});

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of processes) if (!child.killed) child.kill('SIGTERM');
  setTimeout(() => process.exit(code), 250);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
