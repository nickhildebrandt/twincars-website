<script lang="ts">
  /**
   * Branded coloured placeholder for images that will be added later.
   * Uses an SVG gradient with a centred icon — looks intentional, not
   * like a broken `<img>`.
   *
   * @prop {string} label       Short text shown over the gradient.
   * @prop {string=} tone       Accent tone (`primary`|`secondary`|`accent`|`neutral`). Default `primary`.
   * @prop {string=} aspect     Aspect ratio utility, e.g. `aspect-video`. Default `aspect-[4/3]`.
   * @prop {string=} icon       Lucide icon name shown above the label.
   */
  import * as icons from '@lucide/svelte'
  import type { Component } from 'svelte'

  interface Props {
    label?: string
    tone?: 'primary' | 'secondary' | 'accent' | 'neutral'
    aspect?: string
    icon?: string
  }

  let {
    label = '',
    tone = 'primary',
    aspect = 'aspect-[4/3]',
    icon = 'image'
  }: Props = $props()

  const toneClass = $derived(
    {
      primary: 'from-primary/30 via-primary/10 to-base-200 text-primary',
      secondary: 'from-secondary/30 via-secondary/10 to-base-200 text-secondary',
      accent: 'from-accent/30 via-accent/10 to-base-200 text-accent',
      neutral: 'from-neutral/30 via-neutral/10 to-base-200 text-neutral'
    }[tone]
  )

  const iconKey = $derived(
    icon
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('') as keyof typeof icons
  )
  const Icon = $derived(((icons as unknown as Record<string, Component>)[iconKey] ??
    (icons as unknown as Record<string, Component>).Image) as Component<{
    class?: string
    'aria-hidden'?: boolean | 'true' | 'false'
  }>)
</script>

<div
  class="bg-gradient-to-br {toneClass} {aspect} flex items-center justify-center overflow-hidden rounded-2xl"
  role="img"
  aria-label={label || 'Platzhalter-Bild'}
>
  <div class="text-center">
    <Icon class="mx-auto size-10 opacity-70" aria-hidden="true" />
    {#if label}
      <p class="mt-2 text-sm font-medium opacity-80">{label}</p>
    {/if}
  </div>
</div>
