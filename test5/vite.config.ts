import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'

// The deployed path. Also appears three times in ../.github/workflows/deploy.yml
// and once in ../_config.yml's `exclude`. See docs/PLAN.md §2 — `test5` is a
// placeholder name, so those five places are the whole cost of renaming it.
export default defineConfig({
  plugins: [react(), yaml()],
  base: '/test5/',
  test: {
    // Node by default; component tests opt in with a
    // `// @vitest-environment jsdom` docblock.
    environment: 'node',
    setupFiles: ['./src/test-setup.ts'],
  },
})
