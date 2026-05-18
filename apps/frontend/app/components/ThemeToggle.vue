<script setup lang="ts">
const colorMode = useColorMode()

const isOpen = ref(false)

const options = [
  { value: 'system', label: 'Auto', icon: 'lucide:monitor' },
  { value: 'light', label: 'Clair', icon: 'lucide:sun' },
  { value: 'dark', label: 'Sombre', icon: 'lucide:moon' },
] as const

const currentIcon = computed(() => {
  const option = options.find((o) => o.value === colorMode.preference)
  return option?.icon ?? 'lucide:monitor'
})

function selectMode(value: 'system' | 'light' | 'dark') {
  colorMode.preference = value
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.theme-toggle')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="theme-toggle relative">
    <button
      type="button"
      class="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Changer le thème"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <Icon
        :name="currentIcon"
        size="20"
        class="text-gray-700 dark:text-gray-300"
      />
    </button>

    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <ul
        v-if="isOpen"
        role="listbox"
        aria-label="Sélectionner un thème"
        class="absolute right-0 mt-2 w-36 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
      >
        <li
          v-for="option in options"
          :key="option.value"
          role="option"
          :aria-selected="colorMode.preference === option.value"
          class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :class="{
            'text-blue-600 dark:text-blue-400':
              colorMode.preference === option.value,
            'text-gray-700 dark:text-gray-300':
              colorMode.preference !== option.value,
          }"
          @click="selectMode(option.value)"
        >
          <Icon :name="option.icon" size="16" />
          <span class="text-sm">{{ option.label }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>
