export type GeoPoint = {
  lon: number
  lat: number
  alt?: number | undefined
}

export const deg = rad => rad * 180 / Math.PI
export const rad = deg => deg * Math.PI / 180

const R = 6371e3; // metres, earth’s radius (mean radius = 6,371km)

export function global_distance(lat1, lon1, lat2, lon2) {
  /**
   * φ is latitude, λ is longitude
   */
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d
}

export function find_closest(target: GeoPoint, points: GeoPoint[], max_dist = Infinity) {
  if (!points.length) return null
  let min_point = points[0]
  let min_dist = global_distance(
    target.lat,
    target.lon,
    min_point.lat,
    min_point.lon)
  for (const point of points) {
    const dist = global_distance(
      target.lat,
      target.lon,
      point.lat,
      point.lon)
    if (dist < min_dist) {
      min_dist = dist
      min_point = point
    }
  }
  return min_dist < max_dist ? min_point : null
}

export function destination__DEPRECATED__(lon: number, lat: number, Δlon: number, Δlat: number) {
  const dLat = rad(Math.atan(Δlat / R))
  const dLon = rad(Math.atan(Δlon / (R * Math.cos(deg(lat)))))
  return [lon + dLon, lat + dLat]
}

export function destination(lon: number, lat: number, Δlon: number, Δlat: number) {
  const dLat = Δlat * 180 / (Math.PI * R)
  const dLon = Δlon * 180 / (Math.PI * R * Math.cos(deg(lat)))
  return [lon + dLon, lat + dLat]
}