<script lang="ts">
  /**
   * Reusable Leaflet map. Lazily loads the Leaflet library only on the
   * client (`onMount`) so the SSR bundle stays free of `window`
   * references.
   *
   * @prop {number} lat        Latitude of the marker / map center.
   * @prop {number} lon        Longitude of the marker / map center.
   * @prop {number=} zoom      Initial zoom level. Default 16.
   * @prop {string=} popup     Optional HTML popup attached to the marker.
   * @prop {string=} altText   Accessible name for the map region.
   * @prop {string=} height    CSS height. Default `h-96`.
   */
  import { onMount } from 'svelte'

  interface Props {
    lat: number
    lon: number
    zoom?: number
    popup?: string
    altText?: string
    height?: string
  }

  let {
    lat,
    lon,
    zoom = 16,
    popup,
    altText = 'Karte mit dem Standort der Werkstatt',
    height = 'h-96'
  }: Props = $props()

  /** The map host element. Bound via `bind:this`. */
  let mapEl = $state<HTMLDivElement | null>(null)

  onMount(() => {
    /** @type {{ map: import('leaflet').Map } | null} */
    let state: { map: import('leaflet').Map } | null = null
    let cancelled = false

    void (async () => {
      const L = await import('leaflet')
      await import('leaflet/dist/leaflet.css')
      if (cancelled || !mapEl) return

      const map = L.map(mapEl, {
        center: [lat, lon],
        zoom,
        scrollWheelZoom: false,
        attributionControl: true
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
      }).addTo(map)

      const icon = L.divIcon({
        className: 'twincars-marker',
        html: `<div style="background:#cd1316;color:white;border-radius:9999px;padding:8px 12px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.25);white-space:nowrap;">TwinCars</div>`,
        iconSize: [80, 32],
        iconAnchor: [40, 32]
      })
      const marker = L.marker([lat, lon], { icon, title: altText }).addTo(map)
      if (popup) marker.bindPopup(popup).openPopup()

      state = { map }
    })()

    return () => {
      cancelled = true
      state?.map.remove()
    }
  })
</script>

<div
  bind:this={mapEl}
  class="border-base-300 w-full overflow-hidden rounded-2xl border shadow-md {height}"
  role="region"
  aria-label={altText}
></div>
