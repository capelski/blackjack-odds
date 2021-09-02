import React, { CSSProperties } from 'react';
import { actionColors } from '../logic/constants';
import { CardOutcome, OptimalActions } from '../types';

interface OptimalActionsGridProps {
    cardOutcomes: CardOutcome[];
    optimalActions: OptimalActions;
}

export const OptimalActionsGrid: React.FC<OptimalActionsGridProps> = (props) => {
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

                return (
                    <div key={displayScores} style={{ display: 'flex', width: '100%' }}>
                        <span
                            style={{
                                ...spanStyle,
                                borderLeft: '1px solid black'
                            }}
                        >
                            {displayScores}
                        </span>
                        {Object.values(scoreOptimalActions.actions).map((optimalAction) => {
                            return (
                                <span
                                    style={{
                                        ...spanStyle,
                                        backgroundColor: actionColors[optimalAction.playerAction]
                                    }}
                                    key={optimalAction.dealerCard.symbol}
                                >
                                    {optimalAction.playerAction.substring(0, 1)}
                                </span>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};
