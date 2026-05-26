import adapter from '@sveltejs/adapter-node'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * SvelteKit configuration.
 *
 * - `runes: true` opts in to the Svelte 5 runes runtime.
 * - `compilerOptions.experimental.async` enables top-level `await` in components.
 * - `kit.experimental.remoteFunctions` enables `*.remote.ts` files for type-safe
 *   client/server communication (the only data layer we use).
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: { runes: true, experimental: { async: true } },
  kit: {
    adapter: adapter(),
    experimental: { remoteFunctions: true },
    alias: {
      $components: 'src/lib/components',
      $features: 'src/lib/features'
    }
  }
}

export default config
