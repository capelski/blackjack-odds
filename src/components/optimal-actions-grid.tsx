import React, { CSSProperties, useState } from 'react';
import {
    getAggregatedScoreProbabilities,
    getCardOutcomeProbabilities
} from '../logic/all-hands-probabilities';
import { actionColors } from '../logic/constants';
import {
    getEqualToScoreProbability,
    getLowerThanScoreProbability
} from '../logic/hand-probabilities';
import {
    getAggregatedScoreHittingLoss,
    getAggregatedScoreStandingLoss
} from '../logic/optimal-actions';
import { AllHandsProbabilities, CardOutcome, ExpandedRows, OptimalActions } from '../types';
import { RoundedFloat } from './rounded-float';

interface OptimalActionsGridProps {
    cardOutcomes: CardOutcome[];
    dealerProbabilities: AllHandsProbabilities;
    decimals: number;
    optimalActions: OptimalActions;
    playerProbabilities: AllHandsProbabilities;
}

export const OptimalActionsGrid: React.FC<OptimalActionsGridProps> = (props) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const spanStyle: CSSProperties = {
        borderBottom: '1px solid black',
        borderRight: '1px solid black',
        textAlign: 'center',
        width: `${100 / props.cardOutcomes.length + 1}%`
    };

    return (
        <div>
            <div style={{ display: 'flex', width: '100%' }}>
                <span
                    style={{
                        ...spanStyle,
                        borderLeft: '1px solid black',
                        borderTop: '1px solid black'
                    }}
                >
                    -
                </span>
                {props.cardOutcomes.map((cardOutcome) => (
                    <span
                        style={{
                            ...spanStyle,
                            borderTop: '1px solid black'
                        }}
                        key={cardOutcome.symbol}
                    >
                        {cardOutcome.symbol}
                    </span>
                ))}
            </div>
            {Object.values(props.optimalActions).map((scoreOptimalActions) => {
                const displayScores = scoreOptimalActions.aggregatedScore.scores;
                const aggregatedScoreProbabilities = getAggregatedScoreProbabilities(
                    scoreOptimalActions.aggregatedScore,
                    props.playerProbabilities
                );
                const isRowExpanded = expandedRows[displayScores];

                return (
                    <div key={displayScores} style={{ display: 'flex', width: '100%' }}>
                        <span
                            style={{
                                ...spanStyle,
                                borderLeft: '1px solid black'
                            }}
                        >
                            {displayScores}{' '}
                            <span
                                onClick={() => {
                                    setExpandedRows({
                                        ...expandedRows,
                                        [displayScores]: !isRowExpanded
                                    });
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                {isRowExpanded ? '✖️' : '👁️'}
                            </span>
                        </span>
                        {Object.values(scoreOptimalActions.actions).map((optimalAction) => {
                            const cardProbabilities = getCardOutcomeProbabilities(
                                optimalAction.dealerCard,
                                props.dealerProbabilities
                            );

                            return (
                                <span
                                    style={{
                                        ...spanStyle,
                                        backgroundColor: actionColors[optimalAction.playerAction]
                                    }}
                                    key={optimalAction.dealerCard.symbol}
                                >
                                    {optimalAction.playerAction.substring(0, 1)}
                                    {isRowExpanded && (
                                        <React.Fragment>
                                            <br />
                                            <br />
                                            H. loss:
                                            <RoundedFloat
                                                decimals={props.decimals}
                                                value={aggregatedScoreProbabilities.overMaximum}
                                            />
                                            <br />
                                            H. less:
                                            <RoundedFloat
                                                decimals={props.decimals}
                                                value={
                                                    getLowerThanScoreProbability(
                                                        aggregatedScoreProbabilities,
                                                        scoreOptimalActions.aggregatedScore
                                                    ) +
                                                    getEqualToScoreProbability(
                                                        aggregatedScoreProbabilities,
                                                        scoreOptimalActions.aggregatedScore
                                                    )
                                                }
                                            />
                                            <br />
                                            H. worst:
                                            <RoundedFloat
                                                decimals={props.decimals}
                                                value={getAggregatedScoreHittingLoss(
                                                    scoreOptimalActions.aggregatedScore,
                                                    aggregatedScoreProbabilities
                                                )}
                                            />
                                            <br />
                                            S. loss:
                                            <RoundedFloat
                                                decimals={props.decimals}
                                                value={getAggregatedScoreStandingLoss(
                                                    scoreOptimalActions.aggregatedScore,
                                                    cardProbabilities
                                                )}
                                            />
                                        </React.Fragment>
                                    )}
                                </span>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};
