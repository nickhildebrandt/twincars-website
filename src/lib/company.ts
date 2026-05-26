/**
 * @file Static company information used across the public site.
 *
 * Until the Twincars Manager exposes a public `/api/public/company`
 * endpoint (see MISSING_APIS.md), these values are hardcoded so that
 * the website stays self-contained and renders even when the API is
 * unreachable. Update here when the workshop's data changes.
 */

/** Single workshop opening-hour entry (one weekday). */
export interface OpeningHour {
  /** Localised German label, e.g. "Montag – Freitag". */
  label: string
  /** Open-time string in 24h format, e.g. "09:00". */
  open: string
  /** Close-time string in 24h format, e.g. "18:00". */
  close: string
}

/** A single workshop service shown on the homepage. */
export interface ServiceHighlight {
  /** Slug used as an anchor / key in the UI. */
  slug: string
  /** Display title — German. */
  title: string
  /** One-paragraph description shown in the accordion / card. */
  description: string
  /** Lucide icon name. */
  icon: string
}

/**
 * Frozen registry of all customer-facing business information.
 * Importable from anywhere (client or server).
 */
export const company = Object.freeze({
  legalName: 'TwinCars Inh. Lars Becker',
  brandName: 'TwinCars',
  tagline: 'Ihr Kfz-Meisterbetrieb in Bernau bei Berlin',
  address: Object.freeze({
    street: 'Weißenseer Straße 40',
    zip: '16321',
    city: 'Bernau bei Berlin',
    country: 'DE'
  }),
  contact: Object.freeze({
    phone: '03338 9090 200',
    phoneE164: '+493338909200',
    mobile: '0172 310 6562',
    mobileE164: '+491723106562',
    fax: '03338 9090 201',
    email: 'info@twincars.de'
  }),
  /** Decimal coordinates of the workshop entrance — used for Leaflet + JSON-LD. */
  geo: Object.freeze({ lat: 52.672402, lon: 13.581594 }),
  /** Opening hours in display order. */
  openingHours: Object.freeze<readonly OpeningHour[]>([
    { label: 'Montag – Freitag', open: '09:00', close: '18:00' }
  ]),
  /** Year the company was founded (used in "Über uns"). */
  foundedYear: 1996,
  /** Service highlights shown on the home page. */
  services: Object.freeze<readonly ServiceHighlight[]>([
    {
      slug: 'inspektion',
      title: 'Inspektion & Wartung',
      icon: 'wrench',
      description:
        'Vollständige Inspektion nach Herstellervorgaben mit modernster Diagnosetechnik. Wir erkennen auch versteckte Mängel zuverlässig.'
    },
    {
      slug: 'hu-au',
      title: 'HU / AU',
      icon: 'shield-check',
      description:
        'Wir bereiten Ihr Fahrzeug auf die Hauptuntersuchung vor und vereinbaren den Prüftermin direkt in unserer Werkstatt.'
    },
    {
      slug: 'bremsen',
      title: 'Bremsenservice',
      icon: 'octagon-alert',
      description:
        'Bremsanlagen-Check mit Spezialwerkzeug und Diagnosetechnik – streng nach den Vorgaben des Fahrzeugherstellers.'
    },
    {
      slug: 'reifen',
      title: 'Reifen- & Räderservice',
      icon: 'circle-dot',
      description:
        'Beratung, Montage, Wuchten und Einlagerung. Im Reifenshop finden Sie unser tagesaktuelles Sortiment führender Marken.'
    },
    {
      slug: 'klima',
      title: 'Klimaservice',
      icon: 'snowflake',
      description:
        'Kühlleistung, Dichtheit und Hygiene Ihrer Klimaanlage. Wir empfehlen den Check alle 12 Monate.'
    },
    {
      slug: 'achsvermessung',
      title: 'Achsvermessung',
      icon: 'gauge',
      description:
        'Computergesteuerte Achsvermessung und Justierung für optimalen Geradeauslauf, gleichmäßigen Reifenverschleiß und niedrigeren Verbrauch.'
    },
    {
      slug: 'oel',
      title: 'Ölwechsel',
      icon: 'droplet',
      description:
        'Qualitätsöl exakt nach Herstellernorm, neuer Ölfilter, umweltgerechte Entsorgung – damit Ihr Motor lange läuft.'
    },
    {
      slug: 'batterie',
      title: 'Batterieservice',
      icon: 'battery-charging',
      description:
        'Spannungstest, Anschlussprüfung und im Bedarfsfall Austausch durch Qualitätsbatterien führender Marken.'
    },
    {
      slug: 'lichtservice',
      title: 'Lichtservice',
      icon: 'lightbulb',
      description:
        'Beleuchtungs-Check, Einstellung der Scheinwerfer und Austausch defekter Leuchtmittel – damit Sie sehen und gesehen werden.'
    },
    {
      slug: 'auspuff',
      title: 'Auspuff & Abgasanlage',
      icon: 'wind',
      description:
        'Sichtprüfung von Krümmer, Schalldämpfer und Katalysator sowie Austausch defekter Teile in Erstausrüsterqualität.'
    },
    {
      slug: 'unfall',
      title: 'Unfallreparatur',
      icon: 'badge-alert',
      description:
        'Sorgfältige Instandsetzung nach Unfällen, inklusive Lackierarbeiten in unserer Partnerwerkstatt.'
    },
    {
      slug: 'gebrauchtwagen',
      title: 'Gebrauchtwagen',
      icon: 'car',
      description:
        'Geprüfte Gebrauchtwagen aus unserem Bestand – fair bewertet, technisch durchgesehen und sofort verfügbar.'
    }
  ])
})

/** Convenience type alias for the `company` object. */
export type Company = typeof company
