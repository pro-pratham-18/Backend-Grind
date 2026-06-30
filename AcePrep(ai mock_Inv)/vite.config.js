import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CSP_VALUE = [
  "default-src 'self'",
  "connect-src 'self' http://localhost:3001 http://localhost:5173 ws://localhost:5173",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
].join('; ');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'csp-and-wellknown',
      configureServer(server) {
        // 1) Serve .well-known files before Vite's static middleware
        //    (Vite's serve-static ignores .well-known by default)
        server.middlewares.use('/.well-known', (req, res, next) => {
          const filePath = path.join(__dirname, 'public', '.well-known', req.path);
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Security-Policy', CSP_VALUE);
            return res.end(fs.readFileSync(filePath));
          }
          next();
        });

        // 2) Override CSP header on all responses
        server.middlewares.use((_req, res, next) => {
          const originalSetHeader = res.setHeader.bind(res);
          res.setHeader = function (name, value) {
            if (name && typeof name === 'string' && name.toLowerCase() === 'content-security-policy') {
              return originalSetHeader(name, CSP_VALUE);
            }
            return originalSetHeader(name, value);
          };
          next();
        });
      },
    },
  ],
  server: {
    port: 5173,
    open: false,
    // Proxy /api requests to the Express backend in development
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
