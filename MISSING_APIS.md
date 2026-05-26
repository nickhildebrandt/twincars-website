# Fehlende API-Endpoints im Twincars Manager

Die Webseite (`twincars-website`) erwartet einige öffentliche API-Endpoints, die der Twincars Manager (`/home/nick/tc/twincars-manager`) derzeit **noch nicht** implementiert. Sie werden im Client-Code (`src/lib/server/api/client.ts`) bereits aufgerufen — sobald der Manager sie bereitstellt, funktioniert die Seite ohne weitere Änderungen.

Bis dahin behandelt die Webseite Fehler vom fehlenden Endpoint defensiv (Soft-Failure mit nutzerfreundlicher Meldung).

Alle Endpoints sollen wie die bereits vorhandenen authentifiziert werden (`Authorization: Bearer <TC_MANAGER_API_TOKEN>`) und das gleiche `{ data }` / `{ error: { code, message } }` Envelope-Schema nutzen.

---

## 1. `POST /api/public/contact` – Allgemeines Kontakt-/Anfrageformular

**Wird genutzt von:**
- `/kontakt` (allgemeines Kontaktformular)
- `/gebrauchtwagen/[id]` (Fahrzeug-Anfrage)
- `/reifenshop/checkout` (Bestellungen — siehe auch §6 unten)

**Body (JSON):**

```jsonc
{
  "customerEmail": "kunde@example.com",
  "customerName": "Max Mustermann",
  "customerPhone": "0172 1234567",        // optional
  "subject": "Probefahrt VW Polo",
  "message": "Ich interessiere mich für …",
  "referenceId": "uuid-des-fahrzeugs",    // optional
  "referenceType": "used-car"             // "used-car" | "article" | "general"
}
```

**Response 200:**

```jsonc
{ "data": { "inquiryId": "uuid", "receivedAt": "2026-05-26T10:30:00.000Z" } }
```

**Mögliche Fehler:** `400 BAD_REQUEST` bei Validierungsfehlern, `429 RATE_LIMITED` bei Spam-Schutz.

**Auswirkung im Frontend, solange fehlend:** Formulare zeigen freundliche Meldung "wird gerade implementiert, bitte rufen Sie uns an oder schreiben Sie eine E-Mail".

---

## 2. `GET /api/public/used-cars/:id` – Detail eines einzelnen Fahrzeugs

**Wird genutzt von:** `/gebrauchtwagen/[id]`.

Aktuell filtern wir das Fahrzeug clientseitig aus der vollständigen Liste (`/api/public/used-cars`). Das funktioniert für < 50 Fahrzeuge, ist aber bei vielen Bildern und großen Beständen ineffizient.

**Response 200:** identisch zur Liste, nur ein einzelnes Objekt unter `data.vehicle`.

```jsonc
{ "data": { "vehicle": { /* PublicUsedCar */ } } }
```

**Fehler:** `404 NOT_FOUND`.

**Auswirkung solange fehlend:** Funktionsfähig, aber unnötig hohe Bandbreite.

---

## 3. `GET /api/public/articles/:id` – Detail eines einzelnen Shop-Artikels

**Wird genutzt von:** `/reifenshop/[id]`.

Wie bei den Fahrzeugen filtern wir momentan clientseitig aus `/api/public/articles`. Bei größeren Sortimenten lohnt ein Detail-Endpoint.

**Response 200:**

```jsonc
{ "data": { "article": { /* PublicArticle */ } } }
```

**Fehler:** `404 NOT_FOUND`.

---

## 4. `GET /api/public/articles` – Filter-Parameter

Damit der Reifenshop größere Sortimente performant darstellen kann, sollten optionale Query-Parameter unterstützt werden:

- `size` (`205/55R16`, exakte Übereinstimmung)
- `season` (`Sommer` | `Winter` | `Ganzjahres`)
- `brand` (`Continental`, …)
- `maxPriceNet` (Number)
- `q` (Volltext-Suche in `description` / `articleNumber`)

Solange diese fehlen, filtern wir die volle Liste clientseitig.

---

## 5. Produktbilder für Shop-Artikel

`PublicArticle` enthält aktuell **keine Bilder**. Stattdessen rendern wir eine farbige Platzhalter-Grafik. Für eine professionelle Optik sollte das Schema ein Feld `photos` analog zu `PublicUsedCar.photos` erhalten (Mime + Data-URL ODER stabile URLs).

Vorgeschlagene Erweiterung:

```typescript
interface PublicArticle {
  // … bisherige Felder
  photos: { mime: string; url: string }[]
}
```

---

## 6. `POST /api/public/orders` – Eigentliche Bestellabwicklung

**Wird genutzt von:** `/reifenshop/checkout`.

Aktuell senden wir die Bestellung als strukturierte Nachricht über `/api/public/contact` an die Werkstatt. Für eine richtige Bestellabwicklung (mit Versand-/Steuer-Berechnung, Bestellnummer, Statusverfolgung) braucht es einen eigenen Endpoint.

**Body (JSON):**

```jsonc
{
  "customerEmail": "...",
  "customerName": "...",
  "customerPhone": "...",
  "deliveryAddress": {
    "street": "Hauptstr. 1",
    "zip": "12345",
    "city": "Bernau"
  },
  "shippingOptionId": "uuid-versand-option",
  "lines": [
    { "articleId": "uuid", "quantity": 4 }
  ],
  "notes": "Bitte mit Termin am … montieren."
}
```

**Response 200:**

```jsonc
{
  "data": {
    "orderId": "uuid",
    "orderNumber": "2026-05-0001",
    "totalNet": 320.00,
    "totalGross": 380.80,
    "shippingNet": 9.90,
    "estimatedDelivery": "2026-06-01"
  }
}
```

**Bezahlung:** explizit **out-of-scope** für diese Webseite — laut Briefing wird der Zahlungsprozess separat angebunden.

**Auswirkung solange fehlend:** Bestellungen kommen als formatierte E-Mail/Inquiry in der Werkstatt an (über `/api/public/contact`). Der Versand wird derzeit als reine Auswahl gespeichert, aber nicht im System zugeordnet.

---

## 7. `GET /api/public/company` – Stammdaten der Werkstatt

**Wird genutzt von:** `$lib/company.ts` (aktuell hartcodiert).

Wenn der Manager die Stammdaten exponiert, kann die Webseite NAP, Öffnungszeiten und Geo automatisch synchron halten. Bis dahin werden die Werte manuell in `src/lib/company.ts` gepflegt.

**Response 200:**

```jsonc
{
  "data": {
    "company": {
      "legalName": "TwinCars Inh. Lars Becker",
      "brandName": "TwinCars",
      "tagline": "…",
      "address": { "street": "…", "zip": "…", "city": "…", "country": "DE" },
      "contact": { "phone": "…", "mobile": "…", "email": "…" },
      "geo": { "lat": 52.672, "lon": 13.581 },
      "openingHours": [
        { "weekday": "monday", "open": "09:00", "close": "18:00" }
      ]
    }
  }
}
```

---

## 8. `GET /api/public/services/:id` – Detail einer einzelnen Leistung

**Optional.** Aktuell zeigen wir die Leistungen mit den statischen Texten aus `$lib/company.ts`. Wenn der Manager pro Leistung längere Beschreibungen / Bilder / Preisinformationen pflegt, kann die `/leistungen`-Seite das ausspielen.

---

## Reihenfolge der Umsetzung (Vorschlag)

1. **`POST /api/public/contact`** — schaltet drei Formulare gleichzeitig live.
2. **`POST /api/public/orders`** — sobald die echte Bestellabwicklung gewünscht ist.
3. **`GET /api/public/used-cars/:id`** und **`/articles/:id`** — Performance-Verbesserung.
4. **`GET /api/public/articles` Filter** — Performance bei großem Sortiment.
5. **Produktbilder im Shop** — Optik.
6. **`GET /api/public/company`** — Wartungsersparnis.
