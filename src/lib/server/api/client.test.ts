/**
 * Tests for the Twincars Manager API client. We mock the global
 * `fetch` so we never hit the network — only the request shape and
 * the response envelope handling matter here.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The real `config.ts` validates environment variables at import time and
// pulls in `$env/dynamic/*`, which is not available outside the SvelteKit
// runtime. Mock the module path the API client imports so it sees a stable
// config without touching the env loader.
vi.mock('../config', () => ({
  config: {
    apiUrl: 'http://api.test.local',
    apiToken: 'test-token',
    siteUrl: 'https://twin-cars.test',
    isDev: true
  }
}))

const {
  TwincarsApiError,
  fetchPublicFreeSlots,
  fetchPublicService,
  fetchPublicServices,
  fetchPublicShippingOptions,
  fetchPublicTire,
  fetchPublicTires,
  fetchPublicUsedCar,
  fetchPublicUsedCars,
  postPublicAppointment,
  postPublicContact,
  postPublicOrder
} = await import('./client')

type FetchMock = ReturnType<typeof vi.fn<typeof fetch>>

/**
 * Helper that builds a fake `Response` with a JSON body and the given
 * status. Mirrors the `ok`/`json()` parts of the real fetch API.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('api client', () => {
  let fetchMock: FetchMock

  beforeEach(() => {
    fetchMock = vi.fn() as FetchMock
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  describe('request envelope', () => {
    it('attaches Authorization and Accept headers', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { services: [] } }))

      await fetchPublicServices()

      expect(fetchMock).toHaveBeenCalledOnce()
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toBe('http://api.test.local/api/public/services')
      const headers = init?.headers as Headers
      expect(headers.get('Authorization')).toBe('Bearer test-token')
      expect(headers.get('Accept')).toBe('application/json')
    })

    it('unwraps the `data` envelope', async () => {
      const services = [
        {
          id: 's-1',
          articleNumber: 'SVC-OEL',
          description: 'Ölwechsel',
          unit: 'Stück',
          currentPriceNet: 50,
          attributes: {}
        }
      ]
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { services } }))

      const result = await fetchPublicServices()

      expect(result).toEqual(services)
    })

    it('throws TwincarsApiError for `{ error }` envelope', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(
          { error: { code: 'NOT_FOUND', message: 'Nicht gefunden.' } },
          404
        )
      )

      await expect(fetchPublicServices()).rejects.toMatchObject({
        name: 'TwincarsApiError',
        code: 'NOT_FOUND',
        status: 404
      })
    })

    it('throws TwincarsApiError for non-2xx without error envelope', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: null }, 500))

      const err = await fetchPublicServices().catch((e) => e)
      expect(err).toBeInstanceOf(TwincarsApiError)
      expect(err.status).toBe(500)
    })

    it('throws TwincarsApiError when fetch itself fails', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const err = await fetchPublicServices().catch((e) => e)
      expect(err).toBeInstanceOf(TwincarsApiError)
      expect(err.code).toBe('NETWORK')
      expect(err.status).toBe(0)
    })

    it('throws TwincarsApiError on invalid JSON', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('not json', {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )

      const err = await fetchPublicServices().catch((e) => e)
      expect(err).toBeInstanceOf(TwincarsApiError)
      expect(err.code).toBe('BAD_RESPONSE')
    })
  })

  describe('GET endpoints', () => {
    it('fetchPublicTires unwraps the `tires` list', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: {
            tires: [
              {
                id: 't-1',
                articleNumber: 'TC-1',
                brand: 'Continental',
                model: 'PremiumContact 6'
              }
            ]
          }
        })
      )

      const tires = await fetchPublicTires()

      expect(tires).toHaveLength(1)
      expect(tires[0].id).toBe('t-1')
    })

    it('fetchPublicTires forwards filters as query params', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { tires: [] } }))

      await fetchPublicTires({
        q: 'continental',
        size: '205/55R16',
        season: 'Sommer',
        brand: 'Continental',
        maxPriceNet: 200
      })

      const url = String(fetchMock.mock.calls[0][0])
      expect(url).toContain('/api/public/tires?')
      expect(url).toContain('q=continental')
      expect(url).toContain('size=205%2F55R16')
      expect(url).toContain('season=Sommer')
      expect(url).toContain('brand=Continental')
      expect(url).toContain('maxPriceNet=200')
    })

    it('fetchPublicTire unwraps the `tire` object', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { tire: { id: 't-1' } } })
      )

      const tire = await fetchPublicTire('t-1')

      expect(tire.id).toBe('t-1')
      const url = String(fetchMock.mock.calls[0][0])
      expect(url).toBe('http://api.test.local/api/public/tires/t-1')
    })

    it('fetchPublicService unwraps the `service` object', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { service: { id: 's-1' } } })
      )

      const service = await fetchPublicService('s-1')

      expect(service.id).toBe('s-1')
      const url = String(fetchMock.mock.calls[0][0])
      expect(url).toBe('http://api.test.local/api/public/services/s-1')
    })

    it('fetchPublicShippingOptions unwraps the `options` list', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { options: [{ id: 'std' }] } })
      )

      const options = await fetchPublicShippingOptions()

      expect(options).toEqual([{ id: 'std' }])
    })

    it('fetchPublicUsedCars unwraps the `vehicles` list', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { vehicles: [{ id: 'v-1' }] } })
      )

      const cars = await fetchPublicUsedCars()

      expect(cars).toEqual([{ id: 'v-1' }])
    })

    it('fetchPublicUsedCar unwraps the `vehicle` object', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({ data: { vehicle: { id: 'v-1' } } })
      )

      const car = await fetchPublicUsedCar('v-1')

      expect(car.id).toBe('v-1')
      const url = String(fetchMock.mock.calls[0][0])
      expect(url).toBe('http://api.test.local/api/public/used-cars/v-1')
    })

    it('fetchPublicFreeSlots passes query params', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { slots: [] } }))

      await fetchPublicFreeSlots({
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-08T00:00:00.000Z',
        durationMinutes: 60,
        service: 'svc-1'
      })

      const url = String(fetchMock.mock.calls[0][0])
      expect(url).toContain('/api/public/free-slots?')
      expect(url).toContain('from=2026-06-01T00%3A00%3A00.000Z')
      expect(url).toContain('to=2026-06-08T00%3A00%3A00.000Z')
      expect(url).toContain('durationMinutes=60')
      expect(url).toContain('service=svc-1')
    })

    it('fetchPublicFreeSlots omits null/undefined query keys', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ data: { slots: [] } }))

      await fetchPublicFreeSlots({
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-08T00:00:00.000Z'
      })

      const url = String(fetchMock.mock.calls[0][0])
      expect(url).not.toContain('durationMinutes')
      expect(url).not.toContain('service')
    })
  })

  describe('POST endpoints', () => {
    it('postPublicAppointment posts JSON body', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: {
            appointmentId: 'ap-1',
            startsAt: '2026-06-01T10:00:00.000Z',
            endsAt: '2026-06-01T10:30:00.000Z',
            confirmationToken: 'tok-1'
          }
        })
      )

      const result = await postPublicAppointment({
        customerEmail: 'a@b.de',
        customerName: 'A B',
        startsAt: '2026-06-01T10:00:00.000Z'
      })

      expect(result.appointmentId).toBe('ap-1')
      const [, init] = fetchMock.mock.calls[0]
      expect(init?.method).toBe('POST')
      const headers = init?.headers as Headers
      expect(headers.get('Content-Type')).toBe('application/json')
      expect(JSON.parse(String(init?.body))).toMatchObject({
        customerEmail: 'a@b.de'
      })
    })

    it('postPublicAppointment surfaces 409 as TwincarsApiError', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(
          { error: { code: 'SLOT_TAKEN', message: 'Slot belegt.' } },
          409
        )
      )

      const err = await postPublicAppointment({
        customerEmail: 'a@b.de',
        customerName: 'A B',
        startsAt: '2026-06-01T10:00:00.000Z'
      }).catch((e) => e)

      expect(err).toBeInstanceOf(TwincarsApiError)
      expect(err.status).toBe(409)
      expect(err.code).toBe('SLOT_TAKEN')
    })

    it('postPublicOrder posts the order body', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: {
            orderId: 'o-1',
            orderNumber: '2026-05-0001',
            totalNet: 320,
            totalGross: 380.8,
            shippingNet: 9.9,
            estimatedDelivery: '2026-06-01'
          }
        })
      )

      const result = await postPublicOrder({
        customerEmail: 'a@b.de',
        customerName: 'A B',
        deliveryAddress: { street: 'Hauptstr. 1', zip: '12345', city: 'Bernau' },
        shippingOptionId: 'ship-1',
        lines: [{ tireId: 't-1', quantity: 4 }]
      })

      expect(result.orderNumber).toBe('2026-05-0001')
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toBe('http://api.test.local/api/public/orders')
      expect(init?.method).toBe('POST')
      expect(JSON.parse(String(init?.body))).toMatchObject({
        deliveryAddress: { city: 'Bernau' },
        lines: [{ tireId: 't-1', quantity: 4 }]
      })
    })

    it('postPublicContact posts to /api/public/contact', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse({
          data: { inquiryId: 'inq-1', receivedAt: '2026-06-01T10:00:00.000Z' }
        })
      )

      const result = await postPublicContact({
        customerEmail: 'a@b.de',
        customerName: 'A B',
        subject: 'Hallo',
        message: 'Hi'
      })

      expect(result.inquiryId).toBe('inq-1')
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url)).toBe('http://api.test.local/api/public/contact')
      expect(init?.method).toBe('POST')
    })
  })
})
