import type {
  Behavior,
  BehaviorResult,
  ModuleAnswers,
  SurveyModule,
} from '@declic/shared'
import { calculateScore } from './scoring'

/**
 * Result for a single completed module
 */
export interface ModuleResult {
  behavior: Behavior
  moduleName: string
  icon: string
  result: BehaviorResult
}

/**
 * Gets the appropriate result message based on score.
 * Results use threshold-based matching: score <= result.value
 * Returns the highest tier if score exceeds all thresholds.
 */
export function getResultForScore(
  score: number,
  results: BehaviorResult[],
): BehaviorResult | undefined {
  if (results.length === 0) return undefined

  // Sort results by value ascending to ensure correct threshold matching
  const sortedResults = [...results].sort((a, b) => a.value - b.value)

  // Find the first result where score fits within threshold
  for (const result of sortedResults) {
    if (score <= result.value) {
      return result
    }
  }

  // If score exceeds all thresholds, return the highest tier
  return sortedResults[sortedResults.length - 1]
}

/**
 * Computes results for all completed modules.
 * Only includes modules that have answers recorded.
 */
export function computeAllResults(
  modules: SurveyModule[],
  modulesAnswers: Partial<Record<Behavior, ModuleAnswers>>,
): ModuleResult[] {
  const results: ModuleResult[] = []

  for (const module of modules) {
    const answers = modulesAnswers[module.behavior]
    if (!answers) continue

    const score = calculateScore(answers, module)
    const result = getResultForScore(score, module.results)

    if (result) {
      results.push({
        behavior: module.behavior,
        moduleName: module.name,
        icon: module.icon,
        result,
      })
    }
  }

  return results
}
