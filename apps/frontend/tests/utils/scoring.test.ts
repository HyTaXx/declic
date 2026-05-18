import { describe, it, expect } from 'vitest'
import { calculateScore } from '../../app/utils/scoring'
import type {
  ModuleAnswers,
  SurveyModule,
  BehaviorQuestion,
} from '@declic/shared'

describe('Scoring Functions', () => {
  const mockQuestions: BehaviorQuestion[] = [
    {
      id: 'q1',
      type: 'SINGLE_CHOICE',
      text: 'Question 1',
      associatedBehavior: 'ALCOHOL',
      options: [
        { id: 'a1', text: 'Answer 1', value: 10 },
        { id: 'a2', text: 'Answer 2', value: 5 },
        { id: 'a3', text: 'Answer 3', value: 0 },
      ],
    },
    {
      id: 'q2',
      type: 'MULTIPLE_CHOICE',
      text: 'Question 2',
      associatedBehavior: 'ALCOHOL',
      options: [
        { id: 'b1', text: 'Answer B1', value: 20 },
        { id: 'b2', text: 'Answer B2', value: -5 },
      ],
    },
  ]

  const mockModule: SurveyModule = {
    id: 'module-alcohol',
    name: 'Alcool',
    behavior: 'ALCOHOL',
    icon: 'lucide:wine',
    questions: mockQuestions,
    results: [],
  }

  describe('calculateModuleScore', () => {
    it('calculates score correctly for single choice answers', () => {
      const answers: ModuleAnswers = {
        behavior: 'ALCOHOL',
        answers: {
          q1: ['a1'],
          q2: ['b1'],
        },
      }

      const score = calculateScore(answers, mockModule)
      expect(score).toBe(30)
    })

    it('calculates score correctly for multiple choice answers', () => {
      const answers: ModuleAnswers = {
        behavior: 'ALCOHOL',
        answers: {
          q1: ['a1', 'a2'],
        },
      }

      const score = calculateScore(answers, mockModule)
      expect(score).toBe(15)
    })

    it('ignores answers that are not found in the module definition', () => {
      const answers: ModuleAnswers = {
        behavior: 'ALCOHOL',
        answers: {
          q1: ['unknown_answer'],
          unknown_question: ['a1'],
        },
      }

      const score = calculateScore(answers, mockModule)
      expect(score).toBe(0)
    })

    it('handles empty answers', () => {
      const answers: ModuleAnswers = {
        behavior: 'ALCOHOL',
        answers: {},
      }

      const score = calculateScore(answers, mockModule)
      expect(score).toBe(0)
    })
  })
})
