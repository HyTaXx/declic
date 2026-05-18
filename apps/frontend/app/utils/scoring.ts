import type {
  ModuleAnswers,
  SurveyModule,
} from '@declic/shared'

export function calculateScore(
  answers: ModuleAnswers,
  moduleDefinition: SurveyModule,
): number {
  let totalScore = 0

  const questionMap = new Map(moduleDefinition.questions.map((q) => [q.id, q]))

  for (const [questionId, selectedAnswerIds] of Object.entries(
    answers.answers,
  )) {
    const question = questionMap.get(questionId)

    if (question) {
      const optionMap = new Map(question.options.map((o) => [o.id, o]))

      selectedAnswerIds.forEach((answerId) => {
        const option = optionMap.get(answerId)
        if (option && typeof option.value === 'number') {
          totalScore += option.value
        }
      })
    }
  }

  return totalScore
}
