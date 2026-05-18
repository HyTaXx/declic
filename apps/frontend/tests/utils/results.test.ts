import { describe, it, expect } from 'vitest'
import { getResultForScore, computeAllResults } from '../../app/utils/results'
import type {
  BehaviorResult,
  ModuleAnswers,
  SurveyModule,
} from '@declic/shared'

describe('Results Functions', () => {
  const mockResults: BehaviorResult[] = [
    { id: 'result-low', text: 'Low risk message', value: 8 },
    { id: 'result-medium', text: 'Medium risk message', value: 12 },
    { id: 'result-high', text: 'High risk message', value: 18 },
  ]

  describe('getResultForScore', () => {
    it('returns low tier for score within first threshold', () => {
      const result = getResultForScore(5, mockResults)
      expect(result?.id).toBe('result-low')
    })

    it('returns low tier for score exactly at first threshold', () => {
      const result = getResultForScore(8, mockResults)
      expect(result?.id).toBe('result-low')
    })

    it('returns medium tier for score above first threshold', () => {
      const result = getResultForScore(9, mockResults)
      expect(result?.id).toBe('result-medium')
    })

    it('returns medium tier for score exactly at second threshold', () => {
      const result = getResultForScore(12, mockResults)
      expect(result?.id).toBe('result-medium')
    })

    it('returns high tier for score above second threshold', () => {
      const result = getResultForScore(15, mockResults)
      expect(result?.id).toBe('result-high')
    })

    it('returns highest tier for score exceeding all thresholds', () => {
      const result = getResultForScore(25, mockResults)
      expect(result?.id).toBe('result-high')
    })

    it('returns low tier for score of zero', () => {
      const result = getResultForScore(0, mockResults)
      expect(result?.id).toBe('result-low')
    })

    it('returns undefined for empty results array', () => {
      const result = getResultForScore(10, [])
      expect(result).toBeUndefined()
    })

    it('handles unsorted results array correctly', () => {
      const unsortedResults: BehaviorResult[] = [
        { id: 'result-high', text: 'High', value: 18 },
        { id: 'result-low', text: 'Low', value: 8 },
        { id: 'result-medium', text: 'Medium', value: 12 },
      ]
      const result = getResultForScore(10, unsortedResults)
      expect(result?.id).toBe('result-medium')
    })
  })

  describe('computeAllResults', () => {
    const mockModule: SurveyModule = {
      id: 'module-alcohol',
      name: 'Alcool',
      behavior: 'ALCOHOL',
      icon: 'lucide:wine',
      questions: [
        {
          id: 'q1',
          type: 'SINGLE_CHOICE',
          text: 'Question 1',
          associatedBehavior: 'ALCOHOL',
          options: [
            { id: 'a1', text: 'Low', value: 1 },
            { id: 'a2', text: 'High', value: 10 },
          ],
        },
      ],
      results: mockResults,
    }

    const mockModule2: SurveyModule = {
      id: 'module-tobacco',
      name: 'Tabac',
      behavior: 'TOBACCO',
      icon: 'lucide:cigarette',
      questions: [
        {
          id: 'q1',
          type: 'SINGLE_CHOICE',
          text: 'Question 1',
          associatedBehavior: 'TOBACCO',
          options: [
            { id: 't1', text: 'Low', value: 2 },
            { id: 't2', text: 'High', value: 15 },
          ],
        },
      ],
      results: mockResults,
    }

    it('computes results for a single completed module', () => {
      const answers: Partial<Record<string, ModuleAnswers>> = {
        ALCOHOL: { behavior: 'ALCOHOL', answers: { q1: ['a1'] } },
      }

      const results = computeAllResults([mockModule], answers)

      expect(results).toHaveLength(1)
      expect(results[0].behavior).toBe('ALCOHOL')
      expect(results[0].moduleName).toBe('Alcool')
      expect(results[0].icon).toBe('lucide:wine')
      expect(results[0].result.id).toBe('result-low')
    })

    it('computes results for multiple completed modules', () => {
      const answers: Partial<Record<string, ModuleAnswers>> = {
        ALCOHOL: { behavior: 'ALCOHOL', answers: { q1: ['a2'] } }, // score 10 -> medium
        TOBACCO: { behavior: 'TOBACCO', answers: { q1: ['t2'] } }, // score 15 -> high
      }

      const results = computeAllResults([mockModule, mockModule2], answers)

      expect(results).toHaveLength(2)
      expect(results[0].result.id).toBe('result-medium')
      expect(results[1].result.id).toBe('result-high')
    })

    it('skips modules without answers', () => {
      const answers: Partial<Record<string, ModuleAnswers>> = {
        ALCOHOL: { behavior: 'ALCOHOL', answers: { q1: ['a1'] } },
      }

      const results = computeAllResults([mockModule, mockModule2], answers)

      expect(results).toHaveLength(1)
      expect(results[0].behavior).toBe('ALCOHOL')
    })

    it('returns empty array when no modules have answers', () => {
      const results = computeAllResults([mockModule, mockModule2], {})
      expect(results).toHaveLength(0)
    })

    it('returns empty array when modules array is empty', () => {
      const answers: Partial<Record<string, ModuleAnswers>> = {
        ALCOHOL: { behavior: 'ALCOHOL', answers: { q1: ['a1'] } },
      }

      const results = computeAllResults([], answers)
      expect(results).toHaveLength(0)
    })
  })
})
