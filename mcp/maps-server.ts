import { Client } from '@googlemaps/google-maps-services-js'
import { logger } from '@/lib/utils/logger'

export interface MapsPlace {
  name: string
  address: string
  rating?: number
  types: string[]
  openingHours?: string
  phone?: string
  website?: string
  lat: number
  lng: number
}

export interface MapsDirection {
  distance: string
  duration: string
  startAddress: string
  endAddress: string
  steps: string[]
}

export class MapsServer {
  private client: Client | null = null
  private configured: boolean = false

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (apiKey && apiKey !== 'your_google_maps_api_key') {
      this.client = new Client({})
      this.configured = true
    }
  }

  isConfigured(): boolean {
    return this.configured
  }

  async searchPlaces(query: string): Promise<{ places: MapsPlace[] }> {
    logger.info('system', 'MapsServer.searchPlaces', { query })
    if (!this.client) throw new Error('Google Maps is not configured. Set GOOGLE_MAPS_API_KEY in .env')

    const res = await this.client.findPlaceFromText({
      params: {
        input: query,
        inputtype: 'textquery' as any,
        fields: ['name', 'formatted_address', 'rating', 'types', 'geometry', 'opening_hours', 'formatted_phone_number', 'website'],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    const places: MapsPlace[] = (res.data.candidates ?? []).map(c => ({
      name: c.name ?? '',
      address: c.formatted_address ?? '',
      rating: c.rating ?? undefined,
      types: c.types ?? [],
      openingHours: c.opening_hours?.open_now !== undefined ? (c.opening_hours.open_now ? 'Open now' : 'Closed') : undefined,
      phone: c.formatted_phone_number ?? undefined,
      website: c.website ?? undefined,
      lat: c.geometry?.location?.lat ?? 0,
      lng: c.geometry?.location?.lng ?? 0,
    }))

    return { places }
  }

  async findNearbyPlaces(
    lat: number,
    lng: number,
    type?: string,
    radius: number = 1000
  ): Promise<{ places: MapsPlace[] }> {
    logger.info('system', 'MapsServer.findNearbyPlaces', { lat, lng, type, radius })
    if (!this.client) throw new Error('Google Maps is not configured')

    const res = await this.client.placesNearby({
      params: {
        location: { lat, lng },
        radius,
        type: type as any,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    const places: MapsPlace[] = (res.data.results ?? []).map(p => ({
      name: p.name ?? '',
      address: p.vicinity ?? '',
      rating: p.rating ?? undefined,
      types: p.types ?? [],
      openingHours: p.opening_hours?.open_now !== undefined ? (p.opening_hours.open_now ? 'Open now' : 'Closed') : undefined,
      phone: undefined,
      website: undefined,
      lat: p.geometry?.location?.lat ?? 0,
      lng: p.geometry?.location?.lng ?? 0,
    }))

    return { places }
  }

  async getPlaceDetails(placeId: string): Promise<{ place: MapsPlace | null }> {
    logger.info('system', 'MapsServer.getPlaceDetails', { placeId })
    if (!this.client) throw new Error('Google Maps is not configured')

    const res = await this.client.placeDetails({
      params: {
        place_id: placeId,
        fields: ['name', 'formatted_address', 'rating', 'types', 'geometry', 'opening_hours', 'formatted_phone_number', 'website'],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    const d = res.data.result
    if (!d) return { place: null }

    const place: MapsPlace = {
      name: d.name ?? '',
      address: d.formatted_address ?? '',
      rating: d.rating ?? undefined,
      types: d.types ?? [],
      openingHours: d.opening_hours?.open_now !== undefined ? (d.opening_hours.open_now ? 'Open now' : 'Closed') : undefined,
      phone: d.formatted_phone_number ?? undefined,
      website: d.website ?? undefined,
      lat: d.geometry?.location?.lat ?? 0,
      lng: d.geometry?.location?.lng ?? 0,
    }

    return { place }
  }

  async getDirections(
    origin: string,
    destination: string,
    mode: string = 'driving'
  ): Promise<{ directions: MapsDirection | null }> {
    logger.info('system', 'MapsServer.getDirections', { origin, destination, mode })
    if (!this.client) throw new Error('Google Maps is not configured')

    const res = await this.client.directions({
      params: {
        origin,
        destination,
        mode: mode as any,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    const route = res.data.routes?.[0]
    const leg = route?.legs?.[0]
    if (!leg) return { directions: null }

    const directions: MapsDirection = {
      distance: leg.distance?.text ?? '',
      duration: leg.duration?.text ?? '',
      startAddress: leg.start_address ?? '',
      endAddress: leg.end_address ?? '',
      steps: (leg.steps ?? []).map(s => `${s.html_instructions.replace(/<[^>]*>/g, '')} (${s.distance?.text ?? ''})`),
    }

    return { directions }
  }

  async geocode(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
    logger.info('system', 'MapsServer.geocode', { address })
    if (!this.client) throw new Error('Google Maps is not configured')

    const res = await this.client.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    const result = res.data.results?.[0]
    if (!result) return null

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<{ address: string } | null> {
    logger.info('system', 'MapsServer.reverseGeocode', { lat, lng })
    if (!this.client) throw new Error('Google Maps is not configured')

    const res = await this.client.reverseGeocode({
      params: {
        latlng: { lat, lng },
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    })

    const result = res.data.results?.[0]
    if (!result) return null

    return { address: result.formatted_address }
  }
}

export const mapsServer = new MapsServer()
