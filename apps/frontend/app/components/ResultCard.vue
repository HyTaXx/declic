<script setup lang="ts">
import type { Behavior } from '@declic/shared'
import { BEHAVIOR_RESOURCES } from '~/utils/resources'

const props = defineProps<{
  moduleName: string
  icon: string
  resultText: string
  severity: 'low' | 'medium' | 'high'
  behavior: Behavior
}>()

const resource = computed(() => BEHAVIOR_RESOURCES[props.behavior])

const severityConfig = computed(() => {
  if (props.severity === 'low')
    return {
      border: 'border-emerald-200 dark:border-emerald-800',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      icon: 'text-emerald-500 dark:text-emerald-400',
      label: 'Faible risque',
    }
  if (props.severity === 'medium')
    return {
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      icon: 'text-amber-500 dark:text-amber-400',
      label: 'Risque modéré',
    }
  return {
    border: 'border-red-200 dark:border-red-800',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: 'text-red-500 dark:text-red-400',
    label: 'Risque élevé',
  }
})
</script>

<template>
  <article
    class="flex flex-col gap-4 p-6 rounded-xl border bg-white dark:bg-gray-800"
    :class="severityConfig.border"
  >
    <header class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8">
          <Icon
            :name="icon"
            size="32"
            :class="severityConfig.icon"
            aria-hidden="true"
          />
        </div>
        <h3
          class="text-lg font-semibold font-family-poppins text-gray-900 dark:text-white"
        >
          {{ moduleName }}
        </h3>
      </div>
      <span
        class="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full font-family-inter"
        :class="severityConfig.badge"
      >
        {{ severityConfig.label }}
      </span>
    </header>
    <p
      class="text-base text-gray-700 dark:text-gray-300 font-family-inter leading-relaxed"
    >
      {{ resultText }}
    </p>

    <a
      v-if="resource"
      :href="resource.url"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
    >
      <Icon name="lucide:external-link" size="14" aria-hidden="true" />
      {{ resource.label }}
    </a>
  </article>
</template>
