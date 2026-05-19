import type {
  Behavior,
  BehaviorQuestion,
  ModuleAnswers,
  ModuleProgress,
  SurveyConfig,
  SurveyModule,
} from '@declic/shared'

interface SurveyState {
  config: SurveyConfig | null
  error: string | null
  selectedBehaviors: Set<Behavior>
  modules: SurveyModule[]
  currentBehavior: Behavior | null
  currentQuestionIndex: number
  modulesAnswers: Partial<Record<Behavior, ModuleAnswers>>
}

export const useSurveyStore = defineStore('survey', {
  state: (): SurveyState => ({
    config: null,
    error: null,
    selectedBehaviors: new Set(),
    modules: [],
    currentBehavior: null,
    currentQuestionIndex: 0,
    modulesAnswers: {},
  }),

  getters: {
    hasSelection(): boolean {
      return this.selectedBehaviors.size > 0
    },

    isSelected: (state) => (behavior: Behavior) => {
      return state.selectedBehaviors.has(behavior)
    },

    selectedCount(): number {
      return this.selectedBehaviors.size
    },

    currentModule(): SurveyModule | undefined {
      return this.modules.find((m) => m.behavior === this.currentBehavior)
    },

    currentQuestion(): BehaviorQuestion | undefined {
      return this.currentModule?.questions[this.currentQuestionIndex]
    },

    currentAnswers(): string[] {
      if (!this.currentBehavior || !this.currentQuestion) return []
      return (
        this.modulesAnswers[this.currentBehavior]?.answers[
          this.currentQuestion.id
        ] ?? []
      )
    },

    canProceed(): boolean {
      return this.currentAnswers.length > 0
    },

    // Progress tracking getters
    isModuleCompleted: (state) => (behavior: Behavior) => {
      const module = state.modules.find((m) => m.behavior === behavior)
      if (!module) return false

      const moduleAnswers = state.modulesAnswers[behavior]
      if (!moduleAnswers) return false

      // Check if all questions have at least one answer
      return module.questions.every((question) => {
        const answers = moduleAnswers.answers[question.id]
        return answers !== undefined && answers.length > 0
      })
    },

    completedModulesCount(): number {
      return Array.from(this.selectedBehaviors).filter((behavior) =>
        this.isModuleCompleted(behavior),
      ).length
    },

    progressPercentage(): number {
      const totalModules = this.selectedBehaviors.size
      if (totalModules === 0) return 0

      let progress = 0

      // Each module represents an equal portion of the total
      const moduleWeight = 100 / totalModules

      // Calculate progress for each selected behavior
      Array.from(this.selectedBehaviors).forEach((behavior) => {
        const module = this.modules.find((m) => m.behavior === behavior)

        // If module not loaded yet, it contributes 0%
        if (!module) return

        const moduleAnswers = this.modulesAnswers[behavior]
        if (!moduleAnswers) return

        // Count answered questions in this module
        let answeredCount = 0
        module.questions.forEach((question) => {
          const answers = moduleAnswers.answers[question.id]
          if (answers !== undefined && answers.length > 0) {
            answeredCount++
          }
        })

        // Calculate this module's contribution to overall progress
        const moduleProgress =
          (answeredCount / module.questions.length) * moduleWeight
        progress += moduleProgress
      })

      return Math.round(progress)
    },

    canGoBack(): boolean {
      if (this.currentQuestionIndex > 0) return true
      const moduleIndex = this.modules.findIndex(
        (m) => m.behavior === this.currentBehavior,
      )
      return moduleIndex > 0
    },

    modulesProgress(): ModuleProgress[] {
      if (!this.config) return []

      // Follow the order from config, not the selection order
      return this.config.modules
        .filter((moduleRef) => this.selectedBehaviors.has(moduleRef.behavior))
        .map((moduleRef) => {
          const { behavior, name, icon } = moduleRef
          const isCompleted = this.isModuleCompleted(behavior)
          const isCurrent = behavior === this.currentBehavior

          return {
            behavior,
            name,
            icon,
            status: isCompleted
              ? 'completed'
              : isCurrent
                ? 'in_progress'
                : 'pending',
          }
        })
    },
  },

  actions: {
    async loadConfig() {
      this.error = null

      try {
        const config = useRuntimeConfig()
        const baseUrl =
          config.public.url.length > 0
            ? config.public.url
            : useRequestURL().origin
        const url = `${baseUrl}/data/survey-config.json`
        this.config = await $fetch<SurveyConfig>(url)
      } catch (err) {
        this.error =
          err instanceof Error ? err.message : 'Unknown error occurred'
        console.error('Error loading survey config:', err)
      }
    },

    toggleBehavior(behavior: Behavior) {
      if (this.selectedBehaviors.has(behavior)) {
        this.selectedBehaviors.delete(behavior)
      } else {
        this.selectedBehaviors.add(behavior)
      }
    },

    clearSelection() {
      this.selectedBehaviors.clear()
    },

    setCurrentBehavior(behavior: Behavior | null) {
      this.currentBehavior = behavior
    },

    setCurrentQuestionIndex(index: number) {
      this.currentQuestionIndex = index
    },

    toggleAnswer(optionId: string) {
      const question = this.currentQuestion
      const behavior = this.currentBehavior
      if (!question || !behavior) return

      // Initialize module answers if needed
      if (!this.modulesAnswers[behavior]) {
        this.modulesAnswers[behavior] = { behavior, answers: {} }
      }
      const moduleAnswers = this.modulesAnswers[behavior]!

      const currentAnswers = moduleAnswers.answers[question.id] ?? []

      if (question.type === 'SINGLE_CHOICE') {
        moduleAnswers.answers[question.id] = [optionId]
      } else if (currentAnswers.includes(optionId)) {
        moduleAnswers.answers[question.id] = currentAnswers.filter(
          (id) => id !== optionId,
        )
      } else {
        moduleAnswers.answers[question.id] = [...currentAnswers, optionId]
      }
    },

    async loadNextModule(): Promise<SurveyModule | null> {
      if (!this.config) return null

      const loadedBehaviors = new Set(this.modules.map((m) => m.behavior))

      const nextRef = this.config.modules.find((ref) => {
        return (
          this.selectedBehaviors.has(ref.behavior) &&
          !loadedBehaviors.has(ref.behavior)
        )
      })

      if (!nextRef) return null

      const config = useRuntimeConfig()
      const baseUrl =
        config.public.url.length > 0
          ? config.public.url
          : useRequestURL().origin
      const url = `${baseUrl}/data/${nextRef.file}`

      const module = await $fetch<SurveyModule>(url)
      this.modules.push(module)

      return module
    },

    goToPreviousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--
        return
      }
      const moduleIndex = this.modules.findIndex(
        (m) => m.behavior === this.currentBehavior,
      )
      const prevModule = moduleIndex > 0 ? this.modules[moduleIndex - 1] : undefined
      if (prevModule) {
        this.currentBehavior = prevModule.behavior
        this.currentQuestionIndex = prevModule.questions.length - 1
      }
    },

    resetQuiz() {
      this.modulesAnswers = {}
      this.modules = []
      this.currentBehavior = null
      this.currentQuestionIndex = 0
    },
  },
})
