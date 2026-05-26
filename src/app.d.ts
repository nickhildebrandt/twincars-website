/**
 * Ambient types available to every TypeScript file in the project.
 *
 * @see https://svelte.dev/docs/kit/types#app
 */

declare global {
  namespace App {
    interface Error {
      message: string
    }
    interface Locals {}
    interface PageData {}
    interface PageState {}
    interface Platform {}
  }
}

export {}
