<script setup lang="ts">
defineProps<{
  moduleName: string
  icon: string
  resultText: string
}>()
</script>

<template>
  <article
    class="flex flex-col gap-4 p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
  >
    <header class="flex items-center gap-3">
      <div class="w-8 h-8">
        <Icon
          :name="icon"
          size="32"
          class="text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
      </div>
      <h3
        class="text-lg font-semibold font-family-poppins text-gray-900 dark:text-white"
      >
        {{ moduleName }}
      </h3>
    </header>
    <p
      class="text-base text-gray-700 dark:text-gray-300 font-family-inter leading-relaxed"
    >
      {{ resultText }}
    </p>
  </article>
</template>
