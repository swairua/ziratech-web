// vite.config.ts
import { defineConfig } from "file:///root/app/code/node_modules/vite/dist/node/index.js";
import react from "file:///root/app/code/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///root/app/code/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/root/app/code";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Dev proxy: forward API requests to local PHP server running on port 8000
    proxy: {
      // Proxy api.php requests to the PHP dev server
      "/api.php": {
        target: process.env.VITE_DEV_PHP_URL || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path2) => path2
        // keep path as-is
      },
      "/serve_upload.php": {
        target: process.env.VITE_DEV_PHP_URL || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path2) => path2
      },
      // If you need direct access to uploaded files during dev (not required when using serve_upload.php)
      "/uploads": {
        target: process.env.VITE_DEV_PHP_URL || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path2) => path2
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvcm9vdC9hcHAvY29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Jvb3QvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Jvb3QvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICAgIC8vIERldiBwcm94eTogZm9yd2FyZCBBUEkgcmVxdWVzdHMgdG8gbG9jYWwgUEhQIHNlcnZlciBydW5uaW5nIG9uIHBvcnQgODAwMFxuICAgIHByb3h5OiB7XG4gICAgICAvLyBQcm94eSBhcGkucGhwIHJlcXVlc3RzIHRvIHRoZSBQSFAgZGV2IHNlcnZlclxuICAgICAgJy9hcGkucGhwJzoge1xuICAgICAgICB0YXJnZXQ6IHByb2Nlc3MuZW52LlZJVEVfREVWX1BIUF9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMCcsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgsIC8vIGtlZXAgcGF0aCBhcy1pc1xuICAgICAgfSxcbiAgICAgICcvc2VydmVfdXBsb2FkLnBocCc6IHtcbiAgICAgICAgdGFyZ2V0OiBwcm9jZXNzLmVudi5WSVRFX0RFVl9QSFBfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgfSxcbiAgICAgIC8vIElmIHlvdSBuZWVkIGRpcmVjdCBhY2Nlc3MgdG8gdXBsb2FkZWQgZmlsZXMgZHVyaW5nIGRldiAobm90IHJlcXVpcmVkIHdoZW4gdXNpbmcgc2VydmVfdXBsb2FkLnBocClcbiAgICAgICcvdXBsb2Fkcyc6IHtcbiAgICAgICAgdGFyZ2V0OiBwcm9jZXNzLmVudi5WSVRFX0RFVl9QSFBfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjgwMDAnLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0TixTQUFTLG9CQUFvQjtBQUN6UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBSGhDLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFFTixPQUFPO0FBQUE7QUFBQSxNQUVMLFlBQVk7QUFBQSxRQUNWLFFBQVEsUUFBUSxJQUFJLG9CQUFvQjtBQUFBLFFBQ3hDLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFNBQVMsQ0FBQ0EsVUFBU0E7QUFBQTtBQUFBLE1BQ3JCO0FBQUEsTUFDQSxxQkFBcUI7QUFBQSxRQUNuQixRQUFRLFFBQVEsSUFBSSxvQkFBb0I7QUFBQSxRQUN4QyxjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixTQUFTLENBQUNBLFVBQVNBO0FBQUEsTUFDckI7QUFBQTtBQUFBLE1BRUEsWUFBWTtBQUFBLFFBQ1YsUUFBUSxRQUFRLElBQUksb0JBQW9CO0FBQUEsUUFDeEMsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsU0FBUyxDQUFDQSxVQUFTQTtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQ1QsZ0JBQWdCO0FBQUEsRUFDbEIsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUNoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
