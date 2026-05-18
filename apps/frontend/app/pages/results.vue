<script setup lang="ts">
import { computeAllResults } from '~/utils/results'
import { generateResultsPDF } from '~/utils/pdfGenerator'
import EmailModal from '~/components/EmailModal.vue'

useHead({
  title: 'Résultats - Declic',
  meta: [
    {
      name: 'description',
      content:
        'Consulte tes résultats personnalisés et découvre les ressources adaptées à tes besoins.',
    },
  ],
})

const router = useRouter()
const surveyStore = useSurveyStore()

// Compute results from store data
const results = computed(() =>
  computeAllResults(surveyStore.modules, surveyStore.modulesAnswers),
)

// Redirect if no results (direct navigation or empty state)
if (results.value.length === 0) {
  await navigateTo('/')
}

const handleDownloadPDF = () => {
  generateResultsPDF({
    results: results.value,
  })
}

const handleRestart = () => {
  router.push('/')
}

// Email modal
const emailModal = ref<InstanceType<typeof EmailModal> | null>(null)

const handleOpenEmailModal = () => {
  if (emailModal.value) {
    emailModal.value.openModal()
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh p-6">
    <!-- Results Content -->
    <main class="flex flex-col max-w-3xl mx-auto w-full gap-8">
      <!-- Header -->
      <header class="flex flex-col items-center gap-4 text-center">
        <div class="w-16 h-16">
          <Icon
            name="lucide:heart"
            size="64"
            class="text-emerald-500 dark:text-emerald-400"
            aria-hidden="true"
          />
        </div>
        <h1
          class="text-3xl font-bold font-family-poppins text-gray-900 dark:text-white"
        >
          Tes résultats
        </h1>
        <p
          class="text-base text-gray-600 dark:text-gray-400 font-family-inter max-w-lg"
        >
          Voici un aperçu de tes réponses. N'oublie pas : ce questionnaire est
          un outil d'information, pas un diagnostic.
        </p>
      </header>

      <!-- Results Cards -->
      <section class="flex flex-col gap-4" aria-label="Résultats par module">
        <ResultCard
          v-for="result in results"
          :key="result.behavior"
          :module-name="result.moduleName"
          :icon="result.icon"
          :result-text="result.result.text"
        />
      </section>

      <!-- Actions -->
      <nav class="flex flex-col gap-4 mt-4">
        <button
          class="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-900 hover:-translate-y-0.5 dark:bg-blue-500 dark:hover:bg-blue-300 transition-all duration-300 transform"
          @click="handleOpenEmailModal"
        >
          Recevoir mes résultats par email
        </button>

        <button
          class="w-full px-8 py-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-900 hover:-translate-y-0.5 dark:bg-emerald-500 dark:hover:bg-emerald-300 transition-all duration-300 transform flex items-center justify-center gap-2"
          @click="handleDownloadPDF"
        >
          <Icon name="lucide:download" size="20" />
          Télécharger mes résultats (PDF)
        </button>

        <button
          class="w-full px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:-translate-y-0.5 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 transition-all duration-300 transform"
          @click="handleRestart"
        >
          Recommencer le quiz
        </button>

        <NuxtLink
          to="/"
          class="text-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-family-inter py-2"
        >
          Retour à l'accueil
        </NuxtLink>
      </nav>
    </main>

    <EmailModal ref="emailModal" :results="results" />
  </div>
</template>
