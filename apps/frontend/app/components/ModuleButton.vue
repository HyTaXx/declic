<script setup lang="ts">
const props = defineProps<{
  name: string
  icon: string
  selected: boolean
  index?: number
}>()

defineEmits<{
  toggle: []
}>()

const isMounted = ref(false)

onMounted(() => {
  setTimeout(() => (isMounted.value = true), (props.index ?? 0) * 50)
})
</script>

<template>
  <button
    class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 transform cursor-pointer"
    :class="[
      isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16',
      selected
        ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
        : 'border-gray-300 bg-white hover:border-gray-400 hover:translate-x-1 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500',
    ]"
    :aria-pressed="selected"
    :aria-label="`${name}: ${selected ? 'sélectionné' : 'non sélectionné'}`"
    @click="$emit('toggle')"
  >
    <!-- Icon -->
    <div class="w-8 h-8">
      <Icon
        :name="icon"
        size="32"
        :class="{
          'text-blue-600 dark:text-blue-400': selected,
          'text-gray-600 dark:text-gray-400': !selected,
        }"
        aria-hidden="true"
      />
    </div>

    <!-- Module Name -->
    <span
      class="flex-1 text-left text-lg font-medium font-family-inter"
      :class="{
        'text-gray-900 dark:text-white': selected,
        'text-gray-700 dark:text-gray-300': !selected,
      }"
    >
      {{ name }}
    </span>

    <!-- Checkbox -->
    <div class="w-6 h-6">
      <Icon
        :name="selected ? 'lucide:check-circle-2' : 'lucide:circle'"
        size="24"
        :class="{
          'text-blue-600 dark:text-blue-400': selected,
          'text-gray-400 dark:text-gray-500': !selected,
        }"
        aria-hidden="true"
      />
    </div>
  </button>
</template>
