<script lang="ts">
  /**
   * Top-of-page hero section. Uses a CSS gradient placeholder instead
   * of a hero image so the user can later drop in a real photo (the
   * gradient looks intentional, not broken).
   *
   * @prop {string} title       Main headline.
   * @prop {string} subtitle    Supporting paragraph.
   * @prop {string} primaryCta  Label of the primary CTA button.
   * @prop {string} primaryHref Target of the primary CTA.
   * @prop {string=} secondaryCta  Label of the secondary CTA.
   * @prop {string=} secondaryHref Target of the secondary CTA.
   */
  import { ArrowRight, Calendar } from '@lucide/svelte'

  interface Props {
    title: string
    subtitle: string
    primaryCta: string
    primaryHref: string
    secondaryCta?: string
    secondaryHref?: string
  }

  let {
    title,
    subtitle,
    primaryCta,
    primaryHref,
    secondaryCta,
    secondaryHref
  }: Props = $props()
</script>

<section
  class="hero relative overflow-hidden bg-gradient-to-br from-neutral via-neutral to-base-300 text-neutral-content"
  aria-labelledby="hero-title"
>
  <div class="absolute inset-0 opacity-30">
    <div class="absolute -top-32 -left-32 size-96 rounded-full bg-primary blur-3xl"></div>
    <div class="absolute right-0 bottom-0 size-96 translate-x-1/3 translate-y-1/3 rounded-full bg-accent blur-3xl"></div>
  </div>

  <div class="hero-content relative mx-auto w-full max-w-7xl flex-col gap-10 px-4 py-24 text-center lg:flex-row lg:py-32 lg:text-left">
    <div class="max-w-3xl space-y-6">
      <p class="badge badge-primary badge-lg gap-2 font-semibold">
        <span class="inline-block size-2 rounded-full bg-primary-content"></span>
        Kfz-Meisterbetrieb · Bernau bei Berlin
      </p>
      <h1 id="hero-title" class="text-4xl font-bold leading-tight md:text-6xl">
        {title}
      </h1>
      <p class="text-lg opacity-90 md:text-xl">{subtitle}</p>
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
        <a href={primaryHref} class="btn btn-primary btn-lg">
          <Calendar class="size-5" aria-hidden="true" />
          {primaryCta}
        </a>
        {#if secondaryCta && secondaryHref}
          <a href={secondaryHref} class="btn btn-outline btn-lg text-neutral-content">
            {secondaryCta}
            <ArrowRight class="size-5" aria-hidden="true" />
          </a>
        {/if}
      </div>
    </div>
  </div>
</section>
