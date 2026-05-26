<script lang="ts">
  /**
   * Card representing a single workshop service. Uses Lucide for the
   * icon — looked up dynamically by name so a parent can pass the
   * icon as a string without importing it itself.
   *
   * @prop {string} title       Card title.
   * @prop {string} description Card body text.
   * @prop {string=} icon       Lucide icon name (kebab-case).
   * @prop {string=} href       Optional anchor target; when set the card becomes a link.
   */
  import * as icons from '@lucide/svelte'
  import type { Component } from 'svelte'

  interface Props {
    title: string
    description: string
    icon?: string
    href?: string
  }

  let { title, description, icon = 'wrench', href }: Props = $props()

  /**
   * Look up the Lucide icon by name and convert kebab-case to PascalCase.
   * Falls back to the generic `Wrench` icon if the name is unknown.
   */
  const iconKey = $derived(
    icon
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('') as keyof typeof icons
  )
  const Icon = $derived(((icons as unknown as Record<string, Component>)[iconKey] ??
    (icons as unknown as Record<string, Component>).Wrench) as Component<{
    class?: string
    'aria-hidden'?: boolean | 'true' | 'false'
  }>)
</script>

{#if href}
  <a href={href} class="card bg-base-100 border-base-200 hover:border-primary group border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
    <div class="card-body">
      <div class="bg-primary/10 text-primary mb-2 inline-flex size-12 items-center justify-center rounded-2xl">
        <Icon class="size-6" aria-hidden="true" />
      </div>
      <h3 class="card-title">{title}</h3>
      <p class="text-base-content/80 text-sm leading-relaxed">{description}</p>
    </div>
  </a>
{:else}
  <div class="card bg-base-100 border-base-200 border shadow-sm">
    <div class="card-body">
      <div class="bg-primary/10 text-primary mb-2 inline-flex size-12 items-center justify-center rounded-2xl">
        <Icon class="size-6" aria-hidden="true" />
      </div>
      <h3 class="card-title">{title}</h3>
      <p class="text-base-content/80 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
{/if}
