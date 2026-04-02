<script setup lang="ts">
useHead({
  title: 'Sélection des modules - Declic',
  meta: [
    {
      name: 'description',
      content:
        'Choisis les comportements sur lesquels tu souhaites faire le point : alcool, cannabis, jeux, réseaux sociaux et plus encore.',
    },
  ],
})

const surveyStore = useSurveyStore()
const router = useRouter()

surveyStore.resetQuiz()

await callOnce('survey-config', () => surveyStore.loadConfig())

// Toggle handler
const handleToggle = (behavior: Behavior) => {
  surveyStore.toggleBehavior(behavior)
}

// Navigation handler
const handleStartQuiz = () => {
  if (surveyStore.hasSelection) {
    router.push('/quiz')
  }
}
</script>

<template>
  <div class="flex flex-col min-h-dvh p-6">
    <!-- Error State -->
    <div
      v-if="surveyStore.error"
      class="flex flex-col items-center justify-center flex-1 gap-4"
      role="alert"
      aria-live="assertive"
    >
      <div class="w-12 h-12">
        <Icon
          name="lucide:alert-circle"
          size="48"
          class="text-red-500 dark:text-red-400"
          aria-hidden="true"
        />
      </div>
      <p class="text-red-600 dark:text-red-400">{{ surveyStore.error }}</p>
      <NuxtLink to="/" class="text-blue-600 dark:text-blue-400 underline"
        >Retour à l'accueil</NuxtLink
      >
    </div>

    <!-- Main Content -->
    <main
      v-else-if="surveyStore.config"
      class="flex flex-col max-w-3xl mx-auto w-full gap-8"
    >
      <!-- Title Section -->
      <header class="flex flex-col gap-4">
        <h1
          class="text-3xl font-bold font-family-poppins text-gray-900 dark:text-white"
        >
          Sélectionne les comportements sur lesquels tu souhaites faire le point
        </h1>
        <p class="text-base text-gray-600 dark:text-gray-400 font-family-inter">
          Tu peux en choisir plusieurs. Plus tu en sélectionnes, plus le quiz
          sera complet.
        </p>
      </header>

      <!-- Module List -->
      <div
        class="flex flex-col gap-3"
        role="group"
        aria-label="Liste des comportements disponibles"
      >
        <ModuleButton
          v-for="(module, index) in surveyStore.config.modules"
          :key="module.behavior"
          :name="module.name"
          :icon="module.icon"
          :selected="surveyStore.isSelected(module.behavior)"
          :index="index"
          @toggle="handleToggle(module.behavior)"
        />
      </div>

      <!-- CTA Section -->
      <nav class="flex flex-col gap-4 mt-4">
        <button
          :disabled="!surveyStore.hasSelection"
          class="w-full px-8 py-4 font-semibold rounded-lg transition-all duration-300 transform"
          :class="{
            'bg-blue-600 text-white hover:bg-blue-900 hover:-translate-y-0.5 dark:bg-blue-500 dark:hover:bg-blue-300 cursor-pointer':
              surveyStore.hasSelection,
            'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed':
              !surveyStore.hasSelection,
          }"
          :aria-label="
            surveyStore.hasSelection
              ? `Commencer le quiz avec ${surveyStore.selectedCount} comportement${surveyStore.selectedCount > 1 ? 's' : ''} sélectionné${surveyStore.selectedCount > 1 ? 's' : ''}`
              : 'Commencer le quiz - Veuillez sélectionner au moins un comportement'
          "
          @click="handleStartQuiz"
        >
          Commencer le quiz
        </button>

        <NuxtLink
          to="/"
          class="text-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-family-inter"
          aria-label="Retourner à la page d'accueil"
        >
          Retour à l'accueil
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>
