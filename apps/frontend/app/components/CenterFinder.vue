<script setup lang="ts">
import type { Behavior } from '@declic/shared'
import { searchAddressSuggestions, type AddressSuggestion } from '~/utils/geocoding'
import { fetchNearbyCenters, type Center } from '~/utils/overpass'

const props = defineProps<{ behaviors: Behavior[] }>()

const BEHAVIOR_LABELS: Record<Behavior, string> = {
  ALCOHOL: 'Alcool',
  CANNABIS: 'Cannabis',
  TOBACCO: 'Tabac',
  MEDICATION: 'Médicaments',
  PARTY_DRUGS: 'Drogues',
  GAMBLING: 'Jeux d\'argent',
  SOCIAL_MEDIA: 'Réseaux sociaux',
  VIDEO_GAMES: 'Jeux vidéo',
  PORNOGRAPHY: 'Pornographie',
  SNACKING: 'Alimentation',
  OVERWORK: 'Surmenage',
}

const BEHAVIOR_COLORS: Record<Behavior, string> = {
  ALCOHOL:      'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  CANNABIS:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  TOBACCO:      'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  MEDICATION:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PARTY_DRUGS:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  GAMBLING:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  SOCIAL_MEDIA: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  VIDEO_GAMES:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  PORNOGRAPHY:  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  SNACKING:     'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  OVERWORK:     'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
}

const FRANCE_LAT = 46.603354
const FRANCE_LON = 1.888334
const FRANCE_ZOOM = 6

const mapContainer = ref<HTMLElement | null>(null)
const addressInput = ref('')
const radiusKm = ref(10)
const centers = ref<Center[]>([])
const isSearching = ref(false)
const error = ref('')
const resolvedLocation = ref<{ lat: number; lon: number; label: string } | null>(null)
const suggestions = ref<AddressSuggestion[]>([])
const showSuggestions = ref(false)
const isFetchingSuggestions = ref(false)

let leafletMap: import('leaflet').Map | null = null
let markersLayer: import('leaflet').LayerGroup | null = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null
const centerMarkers = new Map<string, import('leaflet').Marker>()
const hoveredCenterId = ref<string | null>(null)
const activeCenterId = ref<string | null>(null)
const listContainer = ref<HTMLElement | null>(null)
const itemRefs = new Map<string, HTMLElement>()

let L: typeof import('leaflet') | null = null

function makeCenterIcon(hovered = false) {
  if (!L) return undefined
  return L.divIcon({
    html: hovered
      ? '<div style="width:20px;height:20px;background:#059669;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);transform:translate(-3px,-3px)"></div>'
      : '<div style="width:14px;height:14px;background:#10b981;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
    className: '',
    iconSize: hovered ? [20, 20] : [14, 14],
    iconAnchor: hovered ? [10, 10] : [7, 7],
  })
}

function onCenterHover(centerId: string | null) {
  if (!L) return

  // Reset previous hovered marker
  if (hoveredCenterId.value) {
    const prev = centerMarkers.get(hoveredCenterId.value)
    const icon = makeCenterIcon(false)
    if (prev && icon) prev.setIcon(icon)
  }

  hoveredCenterId.value = centerId

  // Highlight new hovered marker
  if (centerId) {
    const marker = centerMarkers.get(centerId)
    const icon = makeCenterIcon(true)
    if (marker && icon) marker.setIcon(icon)
  }
}

async function setupMap() {
  if (!mapContainer.value) return
  L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  leafletMap = L.map(mapContainer.value).setView([FRANCE_LAT, FRANCE_LON], FRANCE_ZOOM)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(leafletMap)
  markersLayer = L.layerGroup().addTo(leafletMap)
}

async function updateMapMarkers(lat: number, lon: number) {
  if (!leafletMap || !markersLayer || !L) return

  markersLayer.clearLayers()
  centerMarkers.clear()
  itemRefs.clear()
  hoveredCenterId.value = null
  activeCenterId.value = null

  const userIcon = L.divIcon({
    html: '<div style="width:14px;height:14px;background:#3b82f6;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>',
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
  const centerIcon = makeCenterIcon(false)!

  L.marker([lat, lon], { icon: userIcon }).bindPopup('Votre position').addTo(markersLayer)

  for (const center of centers.value) {
    const popupLines = [
      `<strong>${center.name}</strong>`,
      center.address ? center.address : null,
      center.postcode && center.city ? `${center.postcode} ${center.city}` : (center.city ?? null),
      center.phone ? `📞 ${center.phone}` : null,
      center.openingHours ? `🕐 ${center.openingHours}` : null,
      center.website ? `<a href="${center.website}" target="_blank" rel="noopener noreferrer" style="color:#3b82f6">Site web →</a>` : null,
    ].filter(Boolean).join('<br>')

    const marker = L.marker([center.lat, center.lon], { icon: centerIcon })
      .bindPopup(popupLines, { maxWidth: 260 })
      .addTo(markersLayer)
    marker.on('click', () => scrollToCenter(center.id))
    centerMarkers.set(center.id, marker)
  }

  if (centers.value.length > 0) {
    const allPoints: [number, number][] = [
      [lat, lon],
      ...centers.value.map((c): [number, number] => [c.lat, c.lon]),
    ]
    leafletMap.fitBounds(allPoints, { padding: [48, 48] })
  } else {
    leafletMap.setView([lat, lon], 13)
  }
}

async function search(lat: number, lon: number, label: string) {
  resolvedLocation.value = { lat, lon, label }
  isSearching.value = true
  error.value = ''
  centers.value = []

  try {
    centers.value = await fetchNearbyCenters(lat, lon, radiusKm.value, props.behaviors)
    await nextTick()
    await updateMapMarkers(lat, lon)
  } catch {
    error.value = 'Erreur lors de la recherche. Veuillez réessayer.'
  } finally {
    isSearching.value = false
  }
}

function onAddressInput() {
  if (debounceTimer) clearTimeout(debounceTimer)

  const query = addressInput.value.trim()
  if (query.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }

  isFetchingSuggestions.value = true
  showSuggestions.value = true

  debounceTimer = setTimeout(async () => {
    suggestions.value = await searchAddressSuggestions(query)
    isFetchingSuggestions.value = false
  }, 250)
}

async function selectSuggestion(suggestion: AddressSuggestion) {
  addressInput.value = suggestion.label
  suggestions.value = []
  showSuggestions.value = false
  await search(suggestion.lat, suggestion.lon, suggestion.label)
}

function closeSuggestions() {
  setTimeout(() => { showSuggestions.value = false }, 150)
}

async function searchByGeolocation() {
  if (!navigator.geolocation) {
    error.value = "La géolocalisation n'est pas supportée par votre navigateur."
    return
  }

  isSearching.value = true
  error.value = ''

  await new Promise<void>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await search(pos.coords.latitude, pos.coords.longitude, 'Votre position')
        resolve()
      },
      () => {
        error.value = "Impossible d'accéder à votre position. Vérifiez les permissions du navigateur."
        isSearching.value = false
        resolve()
      },
      { timeout: 10000, enableHighAccuracy: false },
    )
  })
}

async function onRadiusChange() {
  if (resolvedLocation.value) {
    await search(resolvedLocation.value.lat, resolvedLocation.value.lon, resolvedLocation.value.label)
  }
}

function getDirectionsUrl(center: Center): string {
  const dest = center.address && center.city
    ? `${center.address}, ${center.postcode ?? ''} ${center.city}`.trim()
    : `${center.lat},${center.lon}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
}

function scrollToCenter(centerId: string) {
  activeCenterId.value = centerId
  const el = itemRefs.get(centerId)
  if (el && listContainer.value) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
}

function focusCenter(center: Center) {
  const marker = centerMarkers.get(center.id)
  if (!marker || !leafletMap) return
  activeCenterId.value = center.id
  leafletMap.setView([center.lat, center.lon], 15, { animate: true })
  marker.openPopup()
}

onMounted(async () => {
  await nextTick()
  await setupMap()
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  leafletMap?.remove()
  leafletMap = null
  markersLayer = null
})
</script>

<template>
  <section class="flex flex-col gap-4 w-full">
    <div class="flex flex-col gap-1">
      <h2 class="text-xl font-bold font-family-poppins text-gray-900 dark:text-white">
        Trouver un centre d'aide près de chez toi
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 font-family-inter">
        Centres sélectionnés selon tes résultats, dans un rayon de {{ radiusKm }} km.
      </p>
    </div>

    <!-- Address input with autocomplete -->
    <div class="flex flex-col gap-2">
      <div class="relative">
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input
              v-model="addressInput"
              type="text"
              placeholder="Rue, ville, code postal..."
              autocomplete="off"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              @input="onAddressInput"
              @blur="closeSuggestions"
            />
            <div v-if="isFetchingSuggestions" class="absolute right-3 top-1/2 -translate-y-1/2">
              <Icon name="lucide:loader" size="16" class="animate-spin text-gray-400" />
            </div>
          </div>
          <button
            class="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            :disabled="isSearching || !addressInput.trim()"
            @click="suggestions.length ? selectSuggestion(suggestions[0]) : undefined"
          >
            Rechercher
          </button>
        </div>

        <!-- Suggestions dropdown -->
        <ul
          v-if="showSuggestions && suggestions.length > 0"
          class="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg overflow-hidden"
        >
          <li
            v-for="(s, i) in suggestions"
            :key="i"
            class="flex flex-col px-4 py-2.5 text-sm cursor-pointer hover:bg-emerald-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
            @mousedown.prevent="selectSuggestion(s)"
          >
            <span class="font-medium text-gray-900 dark:text-white">{{ s.label }}</span>
            <span v-if="s.context" class="text-xs text-gray-400 dark:text-gray-500">{{ s.context }}</span>
          </li>
        </ul>
      </div>

      <button
        class="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSearching"
        @click="searchByGeolocation"
      >
        <Icon name="lucide:locate" size="16" />
        Utiliser ma position
      </button>
    </div>

    <!-- Radius slider -->
    <div class="flex items-center gap-3">
      <label class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Rayon :</label>
      <input
        v-model.number="radiusKm"
        type="range"
        min="2"
        max="50"
        step="1"
        class="flex-1 accent-emerald-500"
        @change="onRadiusChange"
      />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-14 text-right">
        {{ radiusKm }} km
      </span>
    </div>

    <!-- Status (hors layout carte) -->
    <div v-if="isSearching" class="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
      <Icon name="lucide:loader" size="16" class="animate-spin" />
      Recherche en cours...
    </div>
    <p v-else-if="error" class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>

    <!-- Map + list side by side -->
    <div class="flex gap-4" style="min-height: 420px">
      <!-- Centers list (left) -->
      <div ref="listContainer" class="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto" style="max-height: 420px">
        <p
          v-if="resolvedLocation && !isSearching && centers.length === 0"
          class="text-sm text-gray-500 dark:text-gray-400 text-center py-4"
        >
          Aucun centre trouvé dans un rayon de {{ radiusKm }} km. Essayez d'augmenter le rayon.
        </p>
        <ul v-else-if="resolvedLocation && !isSearching && centers.length > 0" class="flex flex-col gap-2">
          <li
            v-for="center in centers"
            :key="center.id"
            :ref="(el) => { if (el) itemRefs.set(center.id, el as HTMLElement) }"
            class="flex flex-col gap-1 p-3 rounded-lg border transition-colors cursor-pointer"
            :class="activeCenterId === center.id
              ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/20'
              : hoveredCenterId === center.id
                ? 'border-emerald-400 bg-emerald-50/50 dark:border-emerald-500 dark:bg-emerald-900/10'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'"
            @click="focusCenter(center)"
            @mouseenter="onCenterHover(center.id)"
            @mouseleave="onCenterHover(null)"
          >
            <!-- Nom + distance -->
            <div class="flex items-start justify-between gap-2">
              <span class="font-semibold text-sm text-gray-900 dark:text-white leading-tight">{{ center.name }}</span>
              <span class="text-xs text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-medium shrink-0">
                {{ center.distanceKm.toFixed(1) }} km
              </span>
            </div>

            <!-- Badges behaviors -->
            <div v-if="center.behaviors.length > 0" class="flex flex-wrap gap-1 mt-0.5">
              <span
                v-for="b in center.behaviors"
                :key="b"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                :class="BEHAVIOR_COLORS[b]"
              >
                {{ BEHAVIOR_LABELS[b] }}
              </span>
            </div>

            <!-- Opérateur -->
            <p v-if="center.operator" class="text-xs text-gray-400 dark:text-gray-500 italic">
              {{ center.operator }}
            </p>

            <!-- Adresse -->
            <p v-if="center.address || center.city" class="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1 mt-0.5">
              <Icon name="lucide:map-pin" size="11" class="shrink-0 mt-0.5" />
              <span>{{ [center.address, center.postcode && center.city ? `${center.postcode} ${center.city}` : center.city].filter(Boolean).join(', ') }}</span>
            </p>

            <!-- Horaires -->
            <p v-if="center.openingHours" class="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
              <Icon name="lucide:clock" size="11" class="shrink-0 mt-0.5" />
              <span>{{ center.openingHours }}</span>
            </p>

            <!-- Itinéraire -->
            <a
              :href="getDirectionsUrl(center)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 mt-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors self-start"
              @click.stop
            >
              <Icon name="lucide:navigation" size="11" />
              Y aller
            </a>

            <!-- Contacts -->
            <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              <a
                v-if="center.phone"
                :href="`tel:${center.phone}`"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                @click.stop
              >
                <Icon name="lucide:phone" size="11" />{{ center.phone }}
              </a>
              <a
                v-if="center.email"
                :href="`mailto:${center.email}`"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                @click.stop
              >
                <Icon name="lucide:mail" size="11" />{{ center.email }}
              </a>
              <a
                v-if="center.website"
                :href="center.website"
                target="_blank"
                rel="noopener noreferrer"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                @click.stop
              >
                <Icon name="lucide:external-link" size="11" />Site web
              </a>
            </div>
          </li>
        </ul>
      </div>

      <!-- Map (right) -->
      <div
        ref="mapContainer"
        class="flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        style="z-index: 0"
      />
    </div>
  </section>
</template>
