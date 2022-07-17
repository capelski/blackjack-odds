export enum HitStrategy {
    busting = `Hit if P(>21) is less than P(< D)`,
    lowerThanCurrent = `Hit if P(>21) + P(< X) is less than P(< D)`,
    lowerThanDealer = `Hit if P(>21) + Ph(< D) is less than Ps(< D)`
}
