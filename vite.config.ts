import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Dev proxy: forward API requests to local PHP server running on port 8000
    proxy: {
      // Proxy api.php requests to the PHP dev server
      '/api.php': {
        target: process.env.VITE_DEV_PHP_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path, // keep path as-is
      },
      '/serve_upload.php': {
        target: process.env.VITE_DEV_PHP_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      // If you need direct access to uploaded files during dev (not required when using serve_upload.php)
      '/uploads': {
        target: process.env.VITE_DEV_PHP_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
