import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
      // Reduce file watchers by ignoring large/static assets and local DB
      ignored: [
        // Public assets (rarely change during dev; still served correctly)
        'public/backgrounds/**',
        'public/**/*.{png,jpg,jpeg,webp,avif,gif,svg}',
        'public/**/*.{mp4,webm,mov,avi}',
      ],
    },
  },
});
