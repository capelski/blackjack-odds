import { AllHands, CardOutcome, Hand } from '../types';
import { createHand, getHandKey } from './hand';
import { isBustScore } from './utils';

export const getAllHands = (cardOutcomes: CardOutcome[]): AllHands => {
    const allHands: AllHands = {};
    const handsQueue = cardOutcomes.map((cardOutcome) => createHand(cardOutcome, undefined));

    while (handsQueue.length > 0) {
        const hand = handsQueue.pop()!;
        const handKey = getHandKey(hand);

        if (allHands[handKey] === undefined) {
            allHands[handKey] = hand;

            cardOutcomes.forEach((cardOutcome) => {
                const followingHand = createHand(cardOutcome, hand);

                hand.followingHands.push(followingHand);

                if (!isBustScore(followingHand.score)) {
                    handsQueue.push(followingHand);
                }
            });
        } else {
            hand.followingHands = allHands[handKey].followingHands;
        }
    }

    return allHands;
};

export const getRootHands = (allHands: AllHands, cardOutcomes: CardOutcome[]): Hand[] => {
    return cardOutcomes.map((cardOutcome) => {
        const cardHand = createHand(cardOutcome, undefined);
        return allHands[getHandKey(cardHand)];
    });
};
