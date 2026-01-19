import { Point } from '@/types';

/**
 * @description
 * Calculate the distance between two points on the Earth's surface using the Haversine formula.
 * Returns the distance in kilometers.
 */
export function calculateDistance(firstPoint: Point, secondPoint: Point): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const earthRadiusKm = 6371; // Radius of the Earth in kilometers

  const dLat = toRadians(secondPoint.latitude - firstPoint.latitude);
  const dLon = toRadians(secondPoint.longitude - firstPoint.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(firstPoint.latitude)) *
      Math.cos(toRadians(secondPoint.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c; // Distance in kilometers
}
