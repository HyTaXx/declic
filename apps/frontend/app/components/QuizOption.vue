<script setup lang="ts">
const props = defineProps<{
  text: string
  selected: boolean
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
  index?: number
}>()

defineEmits<{
  select: []
}>()

const isMounted = ref(false)

onMounted(() => {
  setTimeout(() => (isMounted.value = true), (props.index ?? 0) * 50)
})
</script>

<template>
  <button
    class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 transform text-left"
    :class="[
      isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-16',
      selected
        ? 'border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
        : 'border-gray-300 bg-white hover:border-gray-400 hover:translate-x-1 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500',
    ]"
    :aria-pressed="selected"
    @click="$emit('select')"
  >
    <!-- Radio/Checkbox Icon -->
    <div class="w-6 h-6">
      <Icon
        :name="
          type === 'SINGLE_CHOICE'
            ? selected
              ? 'lucide:circle-dot'
              : 'lucide:circle'
            : selected
              ? 'lucide:check-square'
              : 'lucide:square'
        "
        size="24"
        :class="{
          'text-blue-600 dark:text-blue-400': selected,
          'text-gray-400 dark:text-gray-500': !selected,
        }"
        aria-hidden="true"
      />
    </div>

    <!-- Option Text -->
    <span
      class="flex-1 text-base font-medium font-family-inter"
      :class="{
        'text-gray-900 dark:text-white': selected,
        'text-gray-700 dark:text-gray-300': !selected,
      }"
    >
      {{ text }}
    </span>
  </button>
</template>
