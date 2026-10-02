import { defineConfig } from 'vite';

export default defineConfig({
  // 상대경로 빌드: 추후 Capacitor 포장 시 file:// 에서도 동작하도록
  base: './',
  build: {
    // Phaser 단일 번들이 약 1.2MB 라 기본 경고(500kB)를 올려둔다
    chunkSizeWarningLimit: 1500,
  },
});
