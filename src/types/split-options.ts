export type SplitOptions = {
    allowed: boolean;
    blackjackAfterSplit: boolean;
    hitSplitAces: boolean;
    // Split is not considered if the player strategy doesn't involve Split
    inUse: boolean;
};
