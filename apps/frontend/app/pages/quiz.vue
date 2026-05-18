<script setup lang="ts">
useHead({
  title: 'Questionnaire - Declic',
  meta: [
    {
      name: 'description',
      content:
        "Réponds aux questions de façon anonyme pour mieux comprendre tes habitudes et identifier les ressources qui peuvent t'aider.",
    },
  ],
})

const router = useRouter()
const surveyStore = useSurveyStore()

// Load first module
const module = await surveyStore.loadNextModule()
if (module) {
  surveyStore.setCurrentBehavior(module.behavior)
}

// Redirect to home if no module/question available
if (!surveyStore.currentModule || !surveyStore.currentQuestion) {
  await navigateTo('/')
}

async function nextQuestion() {
  const module = surveyStore.currentModule
  if (!module) return

  if (surveyStore.currentQuestionIndex < module.questions.length - 1) {
    surveyStore.setCurrentQuestionIndex(surveyStore.currentQuestionIndex + 1)
  } else {
    const nextModule = await surveyStore.loadNextModule()
    if (nextModule) {
      surveyStore.setCurrentBehavior(nextModule.behavior)
      surveyStore.setCurrentQuestionIndex(0)
    } else {
      router.push('/results')
    }
  }
}

const progress = computed(() => {
  const module = surveyStore.currentModule
  if (!module) return { current: 0, total: 0 }
  return {
    current: surveyStore.currentQuestionIndex + 1,
    total: module.questions.length,
  }
})
</script>

<template>
  <div
    v-if="surveyStore.currentModule && surveyStore.currentQuestion"
    class="flex flex-col min-h-dvh p-6"
  >
    <main class="flex flex-col max-w-3xl mx-auto w-full gap-8 flex-1">
      <!-- Progress Bar -->
      <ProgressBar />

      <!-- Header with Module Name and Progress -->
      <header class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-7 h-7">
              <Icon
                :name="surveyStore.currentModule.icon"
                size="28"
                class="text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>
            <span
              class="text-lg font-medium text-gray-700 dark:text-gray-300 font-family-inter"
            >
              {{ surveyStore.currentModule.name }}
            </span>
          </div>
          <span
            class="text-sm text-gray-500 dark:text-gray-400 font-family-inter"
          >
            Question {{ progress.current }}/{{ progress.total }}
          </span>
        </div>
      </header>

      <!-- Question Component -->
      <QuizQuestion :question="surveyStore.currentQuestion" />

      <!-- Navigation -->
      <nav class="flex flex-col gap-4 mt-auto pt-6">
        <button
          :disabled="!surveyStore.canProceed"
          class="w-full px-8 py-4 font-semibold rounded-lg transition-all duration-300 transform"
          :class="{
            'bg-blue-600 text-white hover:bg-blue-900 hover:-translate-y-0.5 dark:bg-blue-500 dark:hover:bg-blue-300':
              surveyStore.canProceed,
            'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400':
              !surveyStore.canProceed,
          }"
          @click="nextQuestion"
        >
          Suivant
        </button>

        <NuxtLink
          to="/select-modules"
          class="text-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-family-inter"
        >
          Quitter le quiz
        </NuxtLink>
      </nav>
    </main>
  </div>
</template>
