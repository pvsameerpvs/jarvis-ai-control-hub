import { mapsServer } from '@/mcp/maps-server'
import { getConfig } from '@/lib/utils/config'
import { logger } from '@/lib/utils/logger'

function isMapsConfigured(): boolean {
  return getConfig('maps_integration') === 'true' && mapsServer.isConfigured()
}

function mapsNotConfiguredResponse() {
  return {
    configured: false as const,
    message: 'Google Maps is not configured. Enable it in settings and set GOOGLE_MAPS_API_KEY in .env.',
  }
}

export async function searchPlaces(query: string) {
  logger.info('system', 'searchPlaces called', { query })
  if (!isMapsConfigured()) return mapsNotConfiguredResponse()
  try {
    return await mapsServer.searchPlaces(query)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function findNearbyPlaces(lat: number, lng: number, type?: string, radius?: number) {
  logger.info('system', 'findNearbyPlaces called', { lat, lng, type, radius })
  if (!isMapsConfigured()) return mapsNotConfiguredResponse()
  try {
    return await mapsServer.findNearbyPlaces(lat, lng, type, radius)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function getPlaceDetails(placeId: string) {
  logger.info('system', 'getPlaceDetails called', { placeId })
  if (!isMapsConfigured()) return mapsNotConfiguredResponse()
  try {
    return await mapsServer.getPlaceDetails(placeId)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function getDirections(origin: string, destination: string, mode?: string) {
  logger.info('system', 'getDirections called', { origin, destination, mode })
  if (!isMapsConfigured()) return mapsNotConfiguredResponse()
  try {
    const travelMode = (mode as 'driving' | 'walking' | 'bicycling' | 'transit') || 'driving'
    return await mapsServer.getDirections(origin, destination, travelMode)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function geocodeAddress(address: string) {
  logger.info('system', 'geocodeAddress called', { address })
  if (!isMapsConfigured()) return mapsNotConfiguredResponse()
  try {
    return await mapsServer.geocode(address)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}

export async function reverseGeocode(lat: number, lng: number) {
  logger.info('system', 'reverseGeocode called', { lat, lng })
  if (!isMapsConfigured()) return mapsNotConfiguredResponse()
  try {
    return await mapsServer.reverseGeocode(lat, lng)
  } catch (error) {
    return { error: true, message: String(error) }
  }
}
