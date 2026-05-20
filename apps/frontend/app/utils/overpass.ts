import type { Behavior } from '@declic/shared'

export type Center = {
  id: string
  name: string
  lat: number
  lon: number
  distanceKm: number
  behaviors: Behavior[]
  address?: string
  postcode?: string
  city?: string
  phone?: string
  website?: string
  email?: string
  openingHours?: string
  operator?: string
  type?: string
}

const BEHAVIOR_SEARCH_TERMS: Record<Behavior, string[]> = {
  ALCOHOL: ['CSAPA', 'addictologie alcool', 'alcoologie'],
  CANNABIS: ['CSAPA', 'addictologie cannabis', 'CAARUD'],
  TOBACCO: ['CSAPA tabac', 'tabacologie', 'addictologie tabac'],
  MEDICATION: ['CSAPA', 'addictologie', 'pharmacodépendance'],
  PARTY_DRUGS: ['CSAPA', 'CAARUD', 'addictologie drogue'],
  GAMBLING: ['CSAPA jeu', 'joueurs pathologiques', 'addictologie jeu'],
  SOCIAL_MEDIA: ['CMP', 'CMPP', 'psychologue addiction numérique'],
  VIDEO_GAMES: ['CMP', 'CMPP', 'addictologie jeux vidéo'],
  PORNOGRAPHY: ['CMP', 'CMPP', 'psychologue sexologue'],
  SNACKING: ['TCA', 'troubles alimentaires', 'CMP diététique'],
  OVERWORK: ['CMP burnout', 'psychologue travail', 'santé mentale'],
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

async function searchTerm(term: string, lat: number, lon: number): Promise<Center[]> {
  const delta = 0.5
  const viewbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
  const params = new URLSearchParams({
    q: term,
    format: 'json',
    limit: '10',
    countrycodes: 'fr',
    addressdetails: '1',
    extratags: '1',
    namedetails: '1',
    viewbox,
    bounded: '0',
  })

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'fr' },
  })
  if (!response.ok) return []

  const data = await response.json()

  return data
    .filter((e: Record<string, unknown>) => e.display_name && e.lat && e.lon)
    .map((e: Record<string, unknown>) => {
      const elLat = parseFloat(e.lat as string)
      const elLon = parseFloat(e.lon as string)
      const parts = (e.display_name as string).split(', ')
      const et = (e.extratags ?? {}) as Record<string, string>
      const addr = (e.address ?? {}) as Record<string, string>

      const street = [addr['house_number'], addr['road']].filter(Boolean).join(' ')
      const address = street || parts.slice(1, 3).join(', ') || undefined

      return {
        id: `${e.osm_type}-${e.osm_id}`,
        name: parts[0] ?? (e.display_name as string),
        lat: elLat,
        lon: elLon,
        distanceKm: haversineKm(lat, lon, elLat, elLon),
        behaviors: [],
        address: address || undefined,
        postcode: addr['postcode'],
        city: addr['city'] ?? addr['town'] ?? addr['village'],
        phone: et['phone'] ?? et['contact:phone'],
        website: et['website'] ?? et['contact:website'],
        email: et['email'] ?? et['contact:email'],
        openingHours: et['opening_hours'],
        operator: et['operator'],
        type: et['social_facility:for'] ?? et['healthcare'],
      } satisfies Center
    })
}

// Maps each term back to all behaviors that use it
function buildTermToBehaviors(behaviors: Behavior[]): Map<string, Behavior[]> {
  const map = new Map<string, Behavior[]>()
  for (const behavior of behaviors) {
    for (const term of BEHAVIOR_SEARCH_TERMS[behavior]) {
      const existing = map.get(term) ?? []
      if (!existing.includes(behavior)) existing.push(behavior)
      map.set(term, existing)
    }
  }
  return map
}

export async function fetchNearbyCenters(
  lat: number,
  lon: number,
  radiusKm: number,
  behaviors: Behavior[],
): Promise<Center[]> {
  const termToBehaviors = buildTermToBehaviors(behaviors)
  const terms = [...termToBehaviors.keys()]

  const batches = await Promise.all(terms.map((term) => searchTerm(term, lat, lon)))

  const byId = new Map<string, Center>()

  for (let i = 0; i < terms.length; i++) {
    const termBehaviors = termToBehaviors.get(terms[i]) ?? []
    for (const center of batches[i]) {
      if (center.distanceKm > radiusKm) continue
      const existing = byId.get(center.id)
      if (existing) {
        for (const b of termBehaviors) {
          if (!existing.behaviors.includes(b)) existing.behaviors.push(b)
        }
      } else {
        byId.set(center.id, { ...center, behaviors: [...termBehaviors] })
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 20)
}
