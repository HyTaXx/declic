export type AddressSuggestion = {
  lat: number
  lon: number
  label: string
  context: string
}

export async function searchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  if (query.trim().length < 2) return []

  const params = new URLSearchParams({ q: query, limit: '6', autocomplete: '1' })
  const response = await fetch(`https://api-adresse.data.gouv.fr/search/?${params}`)
  if (!response.ok) return []

  const data = await response.json()
  return data.features.map((f: Record<string, unknown>) => {
    const props = f.properties as Record<string, string>
    const coords = (f.geometry as Record<string, number[]>).coordinates
    return {
      lat: coords[1],
      lon: coords[0],
      label: props.label,
      context: props.context ?? '',
    }
  })
}
