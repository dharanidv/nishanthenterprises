import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
  // Exclude backend folder from file watching to prevent ENOSPC error
  optimizeDeps: {
    exclude: ['backend']
  },
  // Configure file watching to ignore backend and node_modules
  watch: {
    ignored: [
      '**/backend/**',
      '**/node_modules/**',
      '**/venv/**',
      '**/__pycache__/**',
      '**/.git/**'
    ]
  }
}));
