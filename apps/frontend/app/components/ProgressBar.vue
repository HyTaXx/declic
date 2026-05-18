<script setup lang="ts">
const surveyStore = useSurveyStore()

const progressPercentage = computed(() => surveyStore.progressPercentage)
const modulesProgress = computed(() => surveyStore.modulesProgress)

// Calculate segment width (each module gets equal space)
const segmentWidth = computed(() => {
  const count = modulesProgress.value.length
  return count > 0 ? 100 / count : 0
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Icons Row -->
    <div class="relative flex">
      <div
        v-for="module in modulesProgress"
        :key="`icon-${module.behavior}`"
        class="group flex items-center justify-center"
        :style="{ width: `${segmentWidth}%` }"
      >
        <!-- Module Icon -->
        <div class="relative w-6 h-6 flex items-center justify-center">
          <Icon
            :name="module.icon"
            size="20"
            :class="{
              'text-blue-600 dark:text-blue-400':
                module.status === 'completed' ||
                module.status === 'in_progress',
              'text-gray-400 dark:text-gray-500': module.status === 'pending',
            }"
            class="transition-all group-hover:scale-125"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>

    <!-- Segmented Progress Bar -->
    <div
      class="relative w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
      role="progressbar"
      :aria-valuenow="progressPercentage"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="`Progression du questionnaire : ${progressPercentage}%`"
    >
      <!-- Background Layer: Segments -->
      <div class="absolute inset-0 flex">
        <div
          v-for="(module, index) in modulesProgress"
          :key="`bg-${module.behavior}`"
          class="relative h-full bg-gray-300 dark:bg-gray-600"
          :style="{ width: `${segmentWidth}%` }"
        >
          <!-- Separator Line (except for last segment) -->
          <div
            v-if="index < modulesProgress.length - 1"
            class="absolute right-0 top-0 bottom-0 w-0.75 bg-white dark:bg-gray-900"
          />
        </div>
      </div>

      <!-- Progress Fill Overlay -->
      <div
        class="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full"
        :style="{ width: `${progressPercentage}%` }"
      />
    </div>
  </div>
</template>
