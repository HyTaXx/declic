<script setup lang="ts">
import type { Behavior } from '@declic/shared'

interface VoteRanking {
  behavior: Behavior
  count: number
  percentage: number
}

useHead({
  title: 'Statistiques - Declic',
  meta: [
    {
      name: 'description',
      content:
        'Classement anonyme des comportements les plus souvent sélectionnés sur la plateforme.',
    },
  ],
})

const runtimeConfig = useRuntimeConfig()
const surveyStore = useSurveyStore()

await callOnce('survey-config', () => surveyStore.loadConfig())

const {
  data: ranking,
  error,
  status,
} = await useFetch<VoteRanking[]>(
  () => `${runtimeConfig.public.backendUrl}/api/analytics/votes`,
  {
    immediate: !!runtimeConfig.public.backendUrl,
    server: false,
  },
)

const labelFor = (behavior: Behavior) =>
  surveyStore.config?.modules.find((m) => m.behavior === behavior)?.name ??
  behavior

const totalVotes = computed(() =>
  (ranking.value ?? []).reduce((sum, row) => sum + row.count, 0),
)
</script>

<template>
  <div class="flex flex-col min-h-dvh p-6">
    <main class="flex flex-col max-w-3xl mx-auto w-full gap-8">
      <header class="flex flex-col gap-4">
        <h1
          class="text-3xl font-bold font-family-poppins text-gray-900 dark:text-white"
        >
          Comportements les plus consultés
        </h1>
        <p class="text-base text-gray-600 dark:text-gray-400 font-family-inter">
          Données anonymes issues des sélections sur la première question du
          parcours.
        </p>
      </header>

      <div
        v-if="!runtimeConfig.public.backendUrl"
        class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
        role="alert"
      >
        Configure
        <code class="text-sm">NUXT_PUBLIC_BACKEND_URL</code>
        pour afficher les statistiques.
      </div>

      <div
        v-else-if="error"
        class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        role="alert"
      >
        Impossible de charger les statistiques. Vérifie que le backend et la
        base de données sont démarrés.
      </div>

      <p
        v-else-if="status === 'pending'"
        class="text-gray-600 dark:text-gray-400 font-family-inter"
      >
        Chargement…
      </p>

      <p
        v-else-if="!ranking?.length"
        class="text-gray-600 dark:text-gray-400 font-family-inter"
      >
        Aucune donnée pour le moment.
      </p>

      <ol
        v-else
        class="flex flex-col gap-4"
        aria-label="Classement des comportements"
      >
        <li
          v-for="(row, index) in ranking"
          :key="row.behavior"
          class="flex flex-col gap-2"
        >
          <div class="flex items-baseline justify-between gap-4">
            <span class="font-medium text-gray-900 dark:text-white">
              <span class="text-gray-500 dark:text-gray-400 mr-2"
                >{{ index + 1 }}.</span
              >
              {{ labelFor(row.behavior) }}
            </span>
            <span class="text-sm text-gray-600 dark:text-gray-400 shrink-0">
              {{ row.count }} · {{ row.percentage }}%
            </span>
          </div>
          <div
            class="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden"
            role="progressbar"
            :aria-valuenow="row.percentage"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`${labelFor(row.behavior)} : ${row.percentage}%`"
          >
            <div
              class="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
              :style="{ width: `${row.percentage}%` }"
            />
          </div>
        </li>
      </ol>

      <p
        v-if="ranking?.length"
        class="text-sm text-gray-500 dark:text-gray-400 font-family-inter"
      >
        {{ totalVotes }} sélection{{ totalVotes > 1 ? 's' : '' }} au total
      </p>

      <NuxtLink
        to="/"
        class="text-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-family-inter"
      >
        Retour à l'accueil
      </NuxtLink>
    </main>
  </div>
</template>
