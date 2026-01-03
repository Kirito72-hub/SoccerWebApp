import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // Generate build timestamp for cache busting
  const buildTimestamp = Date.now();

  return {
    publicDir: 'public', // Ensure public folder is copied to dist
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // Inject build timestamp for cache versioning
      '__BUILD_TIMESTAMP__': JSON.stringify(buildTimestamp),
      '__APP_VERSION__': JSON.stringify(env.npm_package_version || '1.6.0')
    },
    build: {
      // Generate unique filenames for cache busting
      rollupOptions: {
        output: {
          // Add hash to filenames for automatic cache invalidation
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`
        }
      },
      // Ensure source maps for debugging
      sourcemap: mode === 'development'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
