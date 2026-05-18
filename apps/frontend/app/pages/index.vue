<script setup lang="ts">
useHead({
  title: 'Accueil - Declic',
  meta: [
    {
      name: 'description',
      content:
        'Dépistage anonyme des comportements à risque et orientation vers les ressources de soutien pour étudiants.',
    },
  ],
})

const surveyStore = useSurveyStore()

surveyStore.resetQuiz()
surveyStore.clearSelection()

await callOnce('survey-config', () => surveyStore.loadConfig())
</script>

<template>
  <main class="flex flex-col items-center justify-center min-h-dvh p-6 gap-8">
    <div
      v-if="surveyStore.error"
      class="flex flex-col items-center gap-4"
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
    </div>

    <div
      v-else-if="surveyStore.config"
      class="flex flex-col items-center gap-6 max-w-2xl text-center"
    >
      <div class="w-16 h-16">
        <Icon
          name="lucide:brain"
          size="64"
          class="text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
      </div>

      <h1 class="text-4xl font-bold font-family-poppins">
        {{ surveyStore.config.title }}
      </h1>

      <p class="text-lg text-gray-700 dark:text-gray-300 font-family-inter">
        {{ surveyStore.config.description }}
      </p>

      <div
        class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
      >
        <div class="w-5 h-5">
          <Icon name="lucide:clock" size="20" aria-hidden="true" />
        </div>
        <span
          >Environ
          {{ surveyStore.config.estimatedDurationMinutes }} minutes</span
        >
      </div>

      <NuxtLink
        to="/select-modules"
        class="mt-4 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-900 hover:-translate-y-0.5 dark:bg-blue-500 dark:hover:bg-blue-300 transition-all duration-300 transform cursor-pointer inline-block"
        aria-label="Commencer le questionnaire"
      >
        Commencer
      </NuxtLink>
    </div>
  </main>
</template>
