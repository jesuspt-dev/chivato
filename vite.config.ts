type CityCenter = [number, number];

const CITY_CENTERS: Record<string, CityCenter> = {
  madrid: [40.4168, -3.7038],
  barcelona: [41.3874, 2.1686],
  granada: [37.1773, -3.5986],
  valencia: [39.4699, -0.3763],
  sevilla: [37.3891, -5.9845],
  malaga: [36.7213, -4.4214],
  zaragoza: [41.6488, -0.8891],
  bilbao: [43.263, -2.935],
  cordoba: [37.8882, -4.7794],
  murcia: [37.9922, -1.1307]
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stableOffset(seed: string, scale = 0.035): [number, number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const latOffset = (((hash % 1000) / 1000) - 0.5) * scale;
  const lngOffset = ((((hash >>> 10) % 1000) / 1000) - 0.5) * scale;
  return [latOffset, lngOffset];
}

export function fallbackCoords(address: string, city: string): [number, number] {
  const center = CITY_CENTERS[normalize(city)] ?? CITY_CENTERS.madrid;
  const [latOffset, lngOffset] = stableOffset(`${address}-${city}`);
  return [Number((center[0] + latOffset).toFixed(6)), Number((center[1] + lngOffset).toFixed(6))];
}

export async function geocodeAddress(address: string, district: string, city: string): Promise<[number, number]> {
  const query = [address, district, city, "España"].filter(Boolean).join(", ");

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: "application/json" } }
    );

    if (!response.ok) return fallbackCoords(address, city);

    const results = (await response.json()) as Array<{ lat?: string; lon?: string }>;
    const first = results[0];
    if (!first?.lat || !first.lon) return fallbackCoords(address, city);

    return [Number(Number(first.lat).toFixed(6)), Number(Number(first.lon).toFixed(6))];
  } catch {
    return fallbackCoords(address, city);
  }
}
