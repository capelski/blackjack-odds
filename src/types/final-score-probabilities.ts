import { ScoreKey } from '../models';
import { Dictionary } from './dictionary';

/**
 * A dictionary with each reachable final score (from a given score), along with the probabilities of reaching each of those scores
 *
 * E.g. For a 16 that hits:
 * {
 *   17: 0.0769,
 *   18: 0.0769,
 *   / * ... * /
 *   26: 0.3076
 * }
 *
 * E.g. For a 16 that stands:
 * {
 *   16: 1
 * }
 */
export type FinalScoreProbabilities = Dictionary<number, number>;

/**
 * A dictionary with the FinalScoreProbabilities of each valid score
 */
export type FinalScoresDictionary = Dictionary<FinalScoreProbabilities, ScoreKey>;
