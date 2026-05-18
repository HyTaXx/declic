import emailjs from '@emailjs/browser'
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
        const message =
          results.length > 0
            ? this.formatResultsForEmail(results)
            : `Bonjour ! Nous avons bien reçu ta demande à l'adresse ${this.email}.`

        const templateParams = {
          email: this.email,
          message,
        }

        await emailjs.send(
          config.public.mailServiceId as string,
          config.public.mailTemplateId as string,
          templateParams,
          config.public.mailPublicKey as string,
        )

        this.statusMessage = 'Email envoyé avec succès !'
        return true
      } catch (error) {
        console.error('EmailJS Error:', error)
        this.statusMessage = "Échec de l'envoi. Veuillez réessayer."
        return false
      } finally {
        this.isSending = false
      }
    },
  },
})
