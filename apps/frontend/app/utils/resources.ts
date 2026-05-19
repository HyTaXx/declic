import type { Behavior } from '@declic/shared'

export interface BehaviorResource {
  label: string
  url: string
}

export const BEHAVIOR_RESOURCES: Record<Behavior, BehaviorResource> = {
  ALCOHOL: {
    label: 'Alcool Info Service',
    url: 'https://www.alcool-info-service.fr',
  },
  TOBACCO: {
    label: 'Tabac Info Service',
    url: 'https://www.tabac-info-service.fr',
  },
  CANNABIS: {
    label: 'Drogues Info Service',
    url: 'https://www.drogues-info-service.fr',
  },
  MEDICATION: {
    label: 'Drogues Info Service',
    url: 'https://www.drogues-info-service.fr',
  },
  PARTY_DRUGS: {
    label: 'Drogues Info Service',
    url: 'https://www.drogues-info-service.fr',
  },
  GAMBLING: {
    label: 'Joueurs Info Service',
    url: 'https://www.joueurs-info-service.fr',
  },
  SOCIAL_MEDIA: {
    label: 'Fil Santé Jeunes',
    url: 'https://www.filsantejeunes.com',
  },
  VIDEO_GAMES: {
    label: 'Fil Santé Jeunes',
    url: 'https://www.filsantejeunes.com',
  },
  PORNOGRAPHY: {
    label: 'Fil Santé Jeunes',
    url: 'https://www.filsantejeunes.com',
  },
  SNACKING: {
    label: 'Fil Santé Jeunes',
    url: 'https://www.filsantejeunes.com',
  },
  OVERWORK: {
    label: 'Fil Santé Jeunes',
    url: 'https://www.filsantejeunes.com',
  },
}
