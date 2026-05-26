/**
 * Tiny stand-in for the Twincars Manager API used during Playwright
 * E2E tests. Boots an HTTP server on the configured port that answers
 * every public-API endpoint the website calls during a full happy-path
 * walk-through.
 *
 * Run with `node e2e/mock-manager.mjs` (or via Playwright's `webServer`).
 */

import { createServer } from 'node:http'
import { URL } from 'node:url'

const PORT = Number(process.env.MOCK_MANAGER_PORT ?? 9999)

const services = [
  {
    id: 'svc-oel',
    articleNumber: 'SVC-OEL',
    description: 'Ölwechsel inkl. Filter',
    unit: 'Stück',
    currentPriceNet: 89,
    attributes: { durationMinutes: 30, category: 'Wartung' }
  },
  {
    id: 'svc-rad',
    articleNumber: 'SVC-RAD',
    description: 'Räderwechsel',
    unit: 'Stück',
    currentPriceNet: 39,
    attributes: { durationMinutes: 45, category: 'Reifen' }
  }
]

const articles = [
  {
    id: 'art-conti-205',
    articleNumber: 'TC-CONTI-205',
    description: 'Continental PremiumContact 6 205/55 R16',
    unit: 'Stück',
    currentPriceNet: 129,
    attributes: { size: '205/55 R16', season: 'Sommer', brand: 'Continental' },
    shippingOptionId: 'std'
  },
  {
    id: 'art-bridge-225',
    articleNumber: 'TC-BS-225',
    description: 'Bridgestone Turanza 225/45 R17',
    unit: 'Stück',
    currentPriceNet: 159,
    attributes: { size: '225/45 R17', season: 'Sommer', brand: 'Bridgestone' },
    shippingOptionId: 'std'
  }
]

const usedCars = [
  {
    id: 'car-polo',
    make: 'VW',
    model: 'Polo 1.0 TSI',
    firstRegistration: '2021-06-15',
    mileageKm: 45000,
    priceGross: 13500,
    fuel: 'Benzin',
    transmission: 'Schaltgetriebe',
    description: 'Sehr gepflegter Polo aus erster Hand.',
    photos: []
  },
  {
    id: 'car-audi',
    make: 'Audi',
    model: 'A3 Sportback',
    firstRegistration: '2019-03-22',
    mileageKm: 78000,
    priceGross: 18900,
    fuel: 'Diesel',
    transmission: 'Automatik',
    description: 'Audi A3 mit Vollausstattung.',
    photos: []
  }
]

const shippingOptions = [
  {
    id: 'std',
    name: 'Standardversand',
    description: '2-4 Werktage',
    priceNet: 7.9,
    freeAboveNet: 200
  },
  {
    id: 'pickup',
    name: 'Abholung in der Werkstatt',
    description: 'Kostenlos, nach Terminabsprache',
    priceNet: 0,
    freeAboveNet: null
  }
]

/** Generates 4 free slots for the requested day, anchored to 09:00 local. */
function freeSlots(fromIso) {
  const out = []
  const base = fromIso ? new Date(fromIso) : new Date()
  if (Number.isNaN(base.getTime())) base.setTime(Date.now())
  base.setHours(9, 0, 0, 0)
  for (let i = 0; i < 4; i++) {
    const s = new Date(base.getTime() + i * 30 * 60 * 1000)
    const e = new Date(s.getTime() + 30 * 60 * 1000)
    out.push({ startsAt: s.toISOString(), endsAt: e.toISOString() })
  }
  return out
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'GET' && url.pathname === '/api/public/services') {
    res.end(JSON.stringify({ data: { services } }))
    return
  }
  if (req.method === 'GET' && url.pathname === '/api/public/articles') {
    res.end(JSON.stringify({ data: { articles } }))
    return
  }
  if (req.method === 'GET' && url.pathname.startsWith('/api/public/articles/')) {
    const id = url.pathname.split('/').pop()
    const article = articles.find((a) => a.id === id)
    if (!article) {
      res.statusCode = 404
      res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Artikel nicht gefunden.' } }))
      return
    }
    res.end(JSON.stringify({ data: { article } }))
    return
  }
  if (req.method === 'GET' && url.pathname === '/api/public/shipping-options') {
    res.end(JSON.stringify({ data: { options: shippingOptions } }))
    return
  }
  if (req.method === 'GET' && url.pathname === '/api/public/used-cars') {
    res.end(JSON.stringify({ data: { vehicles: usedCars } }))
    return
  }
  if (req.method === 'GET' && url.pathname.startsWith('/api/public/used-cars/')) {
    const id = url.pathname.split('/').pop()
    const vehicle = usedCars.find((v) => v.id === id)
    if (!vehicle) {
      res.statusCode = 404
      res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Fahrzeug nicht gefunden.' } }))
      return
    }
    res.end(JSON.stringify({ data: { vehicle } }))
    return
  }
  if (req.method === 'GET' && url.pathname === '/api/public/free-slots') {
    res.end(JSON.stringify({ data: { slots: freeSlots(url.searchParams.get('from')) } }))
    return
  }
  if (req.method === 'POST' && url.pathname === '/api/public/appointments') {
    res.end(
      JSON.stringify({
        data: {
          appointmentId: 'mock-appointment-1',
          startsAt: new Date(Date.now() + 86_400_000).toISOString(),
          endsAt: new Date(Date.now() + 86_400_000 + 30 * 60 * 1000).toISOString(),
          confirmationToken: 'mock-token'
        }
      })
    )
    return
  }
  if (req.method === 'POST' && url.pathname === '/api/public/contact') {
    res.end(
      JSON.stringify({
        data: {
          inquiryId: 'mock-inquiry-1',
          receivedAt: new Date().toISOString()
        }
      })
    )
    return
  }

  res.statusCode = 404
  res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Route nicht definiert.' } }))
})

server.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-manager] listening on http://127.0.0.1:${PORT}`)
})
