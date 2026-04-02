<script setup lang="ts">
defineProps<{
  question: BehaviorQuestion
}>()

const surveyStore = useSurveyStore()

function handleSelect(optionId: string) {
  surveyStore.toggleAnswer(optionId)
}

function isSelected(optionId: string): boolean {
  return surveyStore.currentAnswers.includes(optionId)
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <h1
        class="text-2xl font-bold font-family-poppins text-gray-900 dark:text-white"
      >
        {{ question.text }}
      </h1>
      <p
        v-if="question.subtitle"
        class="text-base text-gray-600 dark:text-gray-400 font-family-inter"
      >
        {{ question.subtitle }}
      </p>
      <p
        v-if="question.type === 'MULTIPLE_CHOICE'"
        class="text-sm text-gray-500 dark:text-gray-400 font-family-inter"
      >
        Plusieurs réponses possibles
      </p>
    </div>

    <!-- Options -->
    <div class="flex flex-col gap-3" role="group" :aria-label="question.text">
      <QuizOption
        v-for="(option, index) in question.options"
        :key="option.id"
        :text="option.text"
        :selected="isSelected(option.id)"
        :type="question.type"
        :index="index"
        @select="handleSelect(option.id)"
      />
    </div>
  </section>
</template>
