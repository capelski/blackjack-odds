export enum PlayerStrategy {
    busting = 'Hit when Ph(>21) is less than Ps(< D)',
    lowerThanCurrent = 'Hit when Ph(>21) + Ph(< X) is less than Ps(< D)',
    lowerThanDealer = 'Hit when Ph(>21) + Ph(< D) is less than Ps(< D)',
    winPushProbabilityComparison = 'Hit when 2 * Ph(win) + Ph(push) is less than 2 * Ps(win) + Ps(push)'
}
