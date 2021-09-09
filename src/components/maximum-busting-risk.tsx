import React from 'react';
import { getAggregatedScoreProbabilities } from '../logic/all-hands-probabilities';
import { isBustScore } from '../logic/utils';
import { AllAggregatedScores, AllHandsProbabilities } from '../types';
import { getRoundedFloat } from './rounded-float';

interface MaximumBustingRiskProps {
    allAggregatedScores: AllAggregatedScores;
    decimals: number;
    nextCardProbabilities: AllHandsProbabilities;
    onChange: (maximumBustingRisk: number) => void;
    selectedRisk: number;
}

export const MaximumBustingRisk: React.FC<MaximumBustingRiskProps> = (props) => {
    const riskOptions = Object.values(props.allAggregatedScores)
        .filter(
            (aggregatedScore) =>
                aggregatedScore.scores.length === 1 &&
                aggregatedScore.score > 10 && // The last score with 0% risk
                !isBustScore(aggregatedScore.score)
        )
        .map((aggregatedScore) => {
            const scoreProbabilities = getAggregatedScoreProbabilities(
                aggregatedScore,
                props.nextCardProbabilities
            );

            return {
                risk: scoreProbabilities.overMaximum,
                standingScore: aggregatedScore.score + 1
            };
        });

    return (
        <div>
            Maximum busting risk allowed for next card:{' '}
            <select
                onChange={(event) => {
                    props.onChange(parseFloat(event.target.value));
                }}
                value={props.selectedRisk}
            >
                {riskOptions.map((riskOption) => {
                    return (
                        <option key={riskOption.standingScore} value={riskOption.risk}>
                            {getRoundedFloat(riskOption.risk, props.decimals)} (standing on{' '}
                            {riskOption.standingScore})
                        </option>
                    );
                })}
            </select>{' '}
            (used to compute long run probabilities)
        </div>
    );
};
