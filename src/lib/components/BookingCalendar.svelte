<script lang="ts">
  /**
   * Month-view calendar for picking an appointment date.
   *
   * Built from scratch on top of DaisyUI / Tailwind — no external
   * calendar library — so the markup stays accessible and the bundle
   * stays small. Pure date logic lives in
   * `$features/termin/calendar.ts` so it can be unit-tested in isolation.
   *
   * @prop {string=} selected   Currently selected day, `YYYY-MM-DD`. Two-way bindable.
   * @prop {string[]=} closedDates  ISO `YYYY-MM-DD` values that should be disabled
   *                                on top of the past+Sunday defaults.
   */
  import { ChevronLeft, ChevronRight } from '@lucide/svelte'
  import {
    MONTH_LABELS_DE,
    WEEKDAY_LABELS_DE,
    buildMonthGrid,
    shiftMonth,
    toIsoDate
  } from '$features/termin/calendar'

  interface Props {
    selected?: string
    closedDates?: string[]
  }

  let { selected = $bindable(''), closedDates = [] }: Props = $props()

  /** Reference date for "today" / "past" classification. Frozen at mount. */
  const today = new Date()

  /** Currently displayed month (year + zero-based month index). */
  let view = $state({ year: today.getFullYear(), month: today.getMonth() })

  /** Grid of 5–6 weeks for the displayed month. */
  const cells = $derived(buildMonthGrid(view.year, view.month, today))

  /** Set of closed ISO dates (Sunday + caller-provided). */
  const closedSet = $derived(new Set(closedDates))

  /**
   * Steps the displayed month by the given delta.
   * @param delta  Number of months to add (negative = back).
   */
  function step(delta: number): void {
    view = shiftMonth(view.year, view.month, delta)
  }

  /**
   * Returns to the current month (and selects today if it's bookable).
   */
  function today_click(): void {
    view = { year: today.getFullYear(), month: today.getMonth() }
    const iso = toIsoDate(today)
    if (!closedSet.has(iso) && today.getDay() !== 0) selected = iso
  }

  /**
   * Returns true if the given cell should be disabled. Past days,
   * Sundays and explicitly-closed dates are not bookable.
   */
  function isDisabled(cell: (typeof cells)[number]): boolean {
    return cell.isPast || cell.isSunday || closedSet.has(cell.iso) || !cell.inMonth
  }
</script>

<div class="card bg-base-100 border-base-200 border" data-testid="booking-calendar">
  <div class="card-body p-4 md:p-6">
    <div class="mb-4 flex items-center justify-between gap-2">
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        onclick={() => step(-1)}
        aria-label="Vorheriger Monat"
      >
        <ChevronLeft class="size-5" aria-hidden="true" />
      </button>
      <h3 class="text-lg font-semibold" aria-live="polite">
        {MONTH_LABELS_DE[view.month]}
        {view.year}
      </h3>
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        onclick={() => step(1)}
        aria-label="Nächster Monat"
      >
        <ChevronRight class="size-5" aria-hidden="true" />
      </button>
    </div>

    <div class="mb-2 flex justify-end">
      <button type="button" class="btn btn-ghost btn-xs" onclick={today_click}>Heute</button>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center" role="grid" aria-label="Terminkalender">
      {#each WEEKDAY_LABELS_DE as label (label)}
        <div class="text-base-content/60 py-2 text-xs font-medium uppercase">{label}</div>
      {/each}
      {#each cells as cell (cell.iso)}
        {@const disabled = isDisabled(cell)}
        {@const isSelected = selected === cell.iso}
        <button
          type="button"
          role="gridcell"
          aria-selected={isSelected}
          aria-disabled={disabled}
          disabled={disabled}
          onclick={() => {
            if (!disabled) selected = cell.iso
          }}
          class="btn btn-sm h-10 w-full p-0 text-sm font-medium"
          class:btn-ghost={!isSelected}
          class:btn-primary={isSelected}
          class:opacity-30={!cell.inMonth}
          class:opacity-40={disabled && cell.inMonth}
          class:ring-2={cell.isToday && !isSelected}
          class:ring-primary={cell.isToday && !isSelected}
        >
          {cell.day}
        </button>
      {/each}
    </div>

    <p class="text-base-content/60 mt-3 text-xs">
      Sonntags geschlossen. Wählen Sie einen Wochentag, um freie Zeiten zu sehen.
    </p>
  </div>
</div>
