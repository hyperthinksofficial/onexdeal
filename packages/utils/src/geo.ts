import {
  DEFAULT_SEARCH_RADIUS_KM,
  SEARCH_RADIUS_KM_OPTIONS,
  type SearchRadiusKm,
} from '@onexdeal/types';

/**
 * Default locality centroid for the Hosur, Krishnagiri district, Tamil Nadu pilot.
 */
export const HOSUR_DEFAULT_LOCALITY = {
  name: 'Hosur Town',
  district: 'Krishnagiri',
  state: 'Tamil Nadu',
  pincode: '635109',
  latitude: 12.7409,
  longitude: 77.8253,
} as const;

/**
 * Converts a search radius in kilometers to meters for PostGIS `ST_DWithin(geography, geography, meters)`.
 */
export function radiusKmToMeters(radiusKm: SearchRadiusKm = DEFAULT_SEARCH_RADIUS_KM): number {
  if (!(SEARCH_RADIUS_KM_OPTIONS as readonly number[]).includes(radiusKm)) {
    throw new RangeError(
      `Invalid search radius ${radiusKm} km. Allowed options: ${SEARCH_RADIUS_KM_OPTIONS.join(', ')} km`,
    );
  }
  return radiusKm * 1000;
}

/**
 * Validates WGS84 latitude and longitude bounds (`EPSG:4326`).
 */
export function isValidWgs84Coordinate(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
