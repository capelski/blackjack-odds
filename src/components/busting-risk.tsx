import React from 'react';
import { getAggregatedScoreProbabilities } from '../logic/all-hands-probabilities';
import { AllAggregatedScores, AllHandsProbabilities } from '../types';
import { getRoundedFloat } from './rounded-float';

interface BustingRiskProps {
    allAggregatedScores: AllAggregatedScores;
    decimals: number;
    nextCardPlayerProbabilities: AllHandsProbabilities;
    onChange: (playerStandingScore: number) => void;
    selectedStandingScore: number;
}

export const BustingRisk: React.FC<BustingRiskProps> = (props) => {
    const riskOptions = Object.values(props.allAggregatedScores)
        .filter(
            (aggregatedScore) => aggregatedScore.scores.length === 1 && aggregatedScore.score > 10
        )
        .map((aggregatedScore) => {
            const scoreProbabilities = getAggregatedScoreProbabilities(
                aggregatedScore,
                props.nextCardPlayerProbabilities
            );

            return {
                bustingRisk: scoreProbabilities.overMaximum,
                standingScore: aggregatedScore.score + 1
            };
        });

    return (
        <div>
            Maximum busting risk allowed for next card:{' '}
            <select
                onChange={(event) => {
                    props.onChange(parseInt(event.target.value));
                }}
                value={props.selectedStandingScore}
            >
                {riskOptions.map((riskOption) => {
                    return (
                        <option key={riskOption.standingScore} value={riskOption.standingScore}>
                            {getRoundedFloat(riskOption.bustingRisk, props.decimals)} (standing on{' '}
                            {riskOption.standingScore})
                        </option>
                    );
                })}
            </select>{' '}
            (used to compute long run probabilities)
        </div>
    );
};
