export enum HitStrategy {
    bustingProbabilityOnly = `Hit if P(>21) is less than P(< D)`,
    includeLowerScore = `Hit if P(>21) + P(< X) is less than P(< D)`
}
