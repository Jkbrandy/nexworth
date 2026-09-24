/**
 * City-center coordinates for the Find Merchants map view — the fallback
 * used when a merchant's own location (see `merchantLatLng` below) hasn't
 * resolved to a precise point yet, so its pin still lands somewhere
 * reasonable instead of being dropped from the map entirely.
 */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  // Ghana
  Accra: [5.6037, -0.187],
  Kumasi: [6.6885, -1.6244],
  Tema: [5.6698, -0.0166],
  Takoradi: [4.8845, -1.7554],
  Tamale: [9.4008, -0.8393],
  "Cape Coast": [5.1053, -1.2466],

  // United Kingdom
  London: [51.5074, -0.1278],
  Manchester: [53.4808, -2.2426],
  Birmingham: [52.4862, -1.8904],
  Liverpool: [53.4084, -2.9916],
  Leeds: [53.8008, -1.5491],
  Glasgow: [55.8642, -4.2518],
  Bristol: [51.4545, -2.5879],
  Edinburgh: [55.9533, -3.1883],
};

/** Each market's flagship city — where a member's own map view focuses by default. */
export const MARKET_DEFAULT_VIEW: Record<"GH" | "UK", [number, number]> = {
  GH: CITY_COORDINATES.Accra,
  UK: CITY_COORDINATES.London,
};

/**
 * A merchant's own precise [lat, lng], if its Maps link has resolved to one —
 * `[0, 0]` is the schema's "not resolved yet" placeholder, not a real point
 * (it's the middle of the Gulf of Guinea), so it's treated as absent here.
 */
export function merchantLatLng(location: { coordinates?: { coordinates: [number, number] } }): [number, number] | null {
  const point = location.coordinates?.coordinates;
  if (!point) return null;
  const [lng, lat] = point;
  if (lng === 0 && lat === 0) return null;
  return [lat, lng];
}
