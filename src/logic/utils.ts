import { dealerStandingScore, maximumScore } from './constants';

export const cartesianProduct = <T, U, R>(
    firstArray: T[],
    secondArray: U[],
    elementBuilder: (t: T, u: U) => R
): R[] => {
    return firstArray.reduce<R[]>((product, x) => {
        return product.concat(secondArray.map((y) => elementBuilder(x, y)));
    }, []);
};

export const getDealerScores = () => {
    const scores: number[] = [];

    for (let i = dealerStandingScore; i <= maximumScore; ++i) {
        scores.push(i);
    }

    return scores;
};

export const getValidScores = (scores: number[]) => {
    const validScores = scores.filter((x) => !isBustScore(x));
    return validScores.length > 0 ? validScores : [scores[0]];
};

export const isBustScore = (score: number) => {
    return score > maximumScore;
};

export const removeDuplicates = <T>(items: T[]) => {
    for (let i = items.length; i > 0; --i) {
        if (items[i] === items[i - 1]) {
            items.splice(i, 1);
        }
    }
};
