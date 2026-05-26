<script lang="ts">
  /**
   * Card teaser for a single used car in the portfolio list.
   *
   * Renders the first photo (or a coloured placeholder), title, key
   * data row and the price. The whole card is a link to the detail
   * page so the entire surface is clickable.
   *
   * @prop {PublicUsedCar} car  Vehicle to render.
   */
  import { Calendar, Cog, Fuel, Gauge } from '@lucide/svelte'
  import PlaceholderImage from '$components/PlaceholderImage.svelte'
  import {
    carTitle,
    formatFirstRegistration,
    formatMileage,
    formatPrice
  } from '$features/gebrauchtwagen/format'
  import type { PublicUsedCar } from '$lib/server/api/types'

  interface Props {
    car: PublicUsedCar
  }

  let { car }: Props = $props()

  const title = $derived(carTitle(car))
  const cover = $derived(car.photos[0] ?? null)
</script>

<a
  href="/gebrauchtwagen/{car.id}"
  class="card bg-base-100 border-base-200 hover:border-primary group block overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
>
  <div class="aspect-[4/3] overflow-hidden bg-base-200">
    {#if cover}
      <img
        src={cover.dataUrl}
        alt={title}
        loading="lazy"
        decoding="async"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    {:else}
      <PlaceholderImage label={title} icon="car" aspect="aspect-[4/3]" tone="primary" />
    {/if}
  </div>
  <div class="card-body p-5">
    <div class="flex items-start justify-between gap-2">
      <h3 class="card-title text-lg leading-tight">{title}</h3>
      <span class="text-primary text-lg font-bold whitespace-nowrap">{formatPrice(car.priceGross)}</span>
    </div>
    <ul class="text-base-content/70 mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      <li class="flex items-center gap-1">
        <Calendar class="size-3.5" aria-hidden="true" />
        <span>EZ {formatFirstRegistration(car.firstRegistration)}</span>
      </li>
      <li class="flex items-center gap-1">
        <Gauge class="size-3.5" aria-hidden="true" />
        <span>{formatMileage(car.mileageKm)}</span>
      </li>
      {#if car.fuel}
        <li class="flex items-center gap-1">
          <Fuel class="size-3.5" aria-hidden="true" />
          <span>{car.fuel}</span>
        </li>
      {/if}
      {#if car.transmission}
        <li class="flex items-center gap-1">
          <Cog class="size-3.5" aria-hidden="true" />
          <span>{car.transmission}</span>
        </li>
      {/if}
    </ul>
  </div>
</a>
