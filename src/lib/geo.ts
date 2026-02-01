export type Unit = 'm' | 'km';

export interface DistanceResult {
  distance: number;
  unit: Unit;
  formatted: string;
}

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance result including value, unit, and formatted string
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): DistanceResult {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // Distance in meters

  if (d < 1000) {
    return {
      distance: Math.round(d),
      unit: 'm',
      formatted: `${Math.round(d)} m`,
    };
  } else {
    const km = d / 1000;
    return {
      distance: Number(km.toFixed(1)),
      unit: 'km',
      formatted: `${km.toFixed(1)} km`,
    };
  }
}

/**
 * Formats a timestamp into a relative "freshness" string (e.g., "5 mins ago")
 * @param timestamp Unix timestamp (ms)
 */
export function formatLocationFreshness(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  // If location is older than 24 hours, don't show specific time
  if (diff > 24 * 60 * 60 * 1000) {
    return 'Active > 24h ago';
  }
  
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  return `${hours} hr${hours > 1 ? 's' : ''} ago`;
}
