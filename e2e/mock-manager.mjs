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

const tires = [
  {
    id: 'tire-conti-205',
    articleNumber: 'TC-CONTI-205',
    brand: 'Continental',
    model: 'PremiumContact 6',
    width: 205,
    aspectRatio: 55,
    construction: 'R',
    diameterInch: 16,
    sizeLabel: '205/55 R16',
    loadIndex: '91',
    speedIndex: 'V',
    season: 'Sommer',
    ean: '4019238791234',
    manufacturerPartNumber: null,
    fuelEfficiency: 'B',
    wetGrip: 'A',
    noiseClass: 'B',
    noiseDb: 71,
    runFlat: false,
    reinforced: false,
    studdedWinter: false,
    mSMarking: true,
    snowFlake: false,
    evCertified: false,
    description: '',
    currentPriceNet: 129,
    photos: [],
    shippingOptionId: 'std'
  },
  {
    id: 'tire-bridge-225',
    articleNumber: 'TC-BS-225',
    brand: 'Bridgestone',
    model: 'Turanza T005',
    width: 225,
    aspectRatio: 45,
    construction: 'R',
    diameterInch: 17,
    sizeLabel: '225/45 R17',
    loadIndex: '94',
    speedIndex: 'Y',
    season: 'Sommer',
    ean: '3286340843911',
    manufacturerPartNumber: null,
    fuelEfficiency: 'A',
    wetGrip: 'A',
    noiseClass: 'A',
    noiseDb: 69,
    runFlat: false,
    reinforced: true,
    studdedWinter: false,
    mSMarking: false,
    snowFlake: false,
    evCertified: false,
    description: '',
    currentPriceNet: 159,
    photos: [],
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

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  res.setHeader('Content-Type', 'application/json')

  if (req.method === 'GET' && url.pathname === '/api/public/services') {
    res.end(JSON.stringify({ data: { services } }))
    return
  }
  if (req.method === 'GET' && url.pathname.startsWith('/api/public/services/')) {
    const id = url.pathname.split('/').pop()
    const service = services.find((s) => s.id === id)
    if (!service) {
      res.statusCode = 404
      res.end(
        JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Leistung nicht gefunden.' }
        })
      )
      return
    }
    res.end(JSON.stringify({ data: { service } }))
    return
  }
  if (req.method === 'GET' && url.pathname === '/api/public/tires') {
    res.end(JSON.stringify({ data: { tires } }))
    return
  }
  if (req.method === 'GET' && url.pathname.startsWith('/api/public/tires/')) {
    const id = url.pathname.split('/').pop()
    const tire = tires.find((t) => t.id === id)
    if (!tire) {
      res.statusCode = 404
      res.end(
        JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Reifen nicht gefunden.' }
        })
      )
      return
    }
    res.end(JSON.stringify({ data: { tire } }))
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
      res.end(
        JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Fahrzeug nicht gefunden.' }
        })
      )
      return
    }
    res.end(JSON.stringify({ data: { vehicle } }))
    return
  }
  if (req.method === 'GET' && url.pathname === '/api/public/free-slots') {
    res.end(
      JSON.stringify({ data: { slots: freeSlots(url.searchParams.get('from')) } })
    )
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
  if (req.method === 'POST' && url.pathname === '/api/public/orders') {
    const body = await readJsonBody(req).catch(() => ({}))
    const lines = Array.isArray(body.lines) ? body.lines : []
    const totalNet = lines.reduce((sum, l) => {
      const tire = tires.find((t) => t.id === l.tireId)
      const price = tire?.currentPriceNet ?? 0
      const qty = Number(l.quantity) || 0
      return sum + price * qty
    }, 0)
    const shipping = shippingOptions.find((o) => o.id === body.shippingOptionId)
    const shippingNet = shipping?.priceNet ?? 0
    const totalGross = Number(((totalNet + shippingNet) * 1.19).toFixed(2))
    res.end(
      JSON.stringify({
        data: {
          orderId: 'mock-order-1',
          orderNumber: '2026-05-0001',
          totalNet,
          totalGross,
          shippingNet,
          estimatedDelivery: new Date(Date.now() + 5 * 86_400_000)
            .toISOString()
            .slice(0, 10)
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
  res.end(
    JSON.stringify({
      error: { code: 'NOT_FOUND', message: 'Route nicht definiert.' }
    })
  )
})

server.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-manager] listening on http://127.0.0.1:${PORT}`)
})
