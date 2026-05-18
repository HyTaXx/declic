import type { ModuleResult } from '~/utils/results'

export const useMailStore = defineStore('mail', {
  state: () => ({
    email: '',
    statusMessage: '',
    isSending: false,
    gdprConsent: false,
  }),

  getters: {
    isEmailValid: (state) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(state.email)
    },

    isFormValid(): boolean {
      return this.isEmailValid && this.gdprConsent
    },
  },

  actions: {
    setEmail(value: string) {
      this.email = value
    },

    resetForm() {
      this.email = ''
      this.statusMessage = ''
      this.gdprConsent = false
    },

    formatResultsForEmail(results: ModuleResult[]): string {
      let message = 'Bonjour,\n\nVoici le récapitulatif de tes résultats :\n\n'

      for (const result of results) {
        message += `📋 ${result.moduleName}\n`
        message += `${result.result.text}\n\n`
      }

      message +=
        "Ce questionnaire est un outil d'information, pas un diagnostic.\n"
      message +=
        "Pour toute question, n'hésite pas à consulter un professionnel de santé."

      return message
    },

    async sendEmail(results: ModuleResult[] = []) {
      if (!this.isFormValid) return false

      this.isSending = true
      this.statusMessage = ''

      try {
        const config = useRuntimeConfig()
        const apiUrl = config.public.apiUrl.replace(/\/$/, '')
        const message =
          results.length > 0
            ? this.formatResultsForEmail(results)
            : `Bonjour ! Nous avons bien reçu ta demande à l'adresse ${this.email}.`

        await $fetch(`${apiUrl}/api/send-email`, {
          method: 'POST',
          body: {
            email: this.email,
            message,
          },
        })

        this.statusMessage = 'Email envoyé avec succès !'
        return true
      } catch (error) {
        const statusCode =
          typeof error === 'object' && error !== null && 'statusCode' in error
            ? Number(error.statusCode)
            : undefined

        if (statusCode === 429) {
          this.statusMessage = 'Trop de tentatives. Veuillez réessayer plus tard.'
        } else if (statusCode === 503) {
          this.statusMessage = "Le service d'envoi est indisponible."
        } else {
          this.statusMessage = "Échec de l'envoi. Veuillez réessayer."
        }

        console.error('Mail API Error:', error)
        return false
      } finally {
        this.isSending = false
      }
    },
  },
})
