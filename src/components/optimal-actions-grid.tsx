import React, { CSSProperties, useState } from 'react';
import { actionColors } from '../logic/constants';
import { getOverallTurnover } from '../logic/turnover';
import { AllHandsProbabilities, CardOutcome, ExpandedRows, OptimalActions } from '../types';
import { TurnoverComponent } from './turnover-component';

interface OptimalActionsGridProps {
    cardOutcomes: CardOutcome[];
    dealerProbabilities: AllHandsProbabilities;
    decimals: number;
    optimalActions: OptimalActions;
    outcomesWeight: number;
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

    const overallTurnover = getOverallTurnover(
        props.cardOutcomes,
        props.optimalActions,
        props.outcomesWeight
    );

    return (
        <div>
            <TurnoverComponent decimals={props.decimals} turnover={overallTurnover} />
            <br />
            <br />
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
            {Object.values(props.optimalActions).map((scoreAllActions) => {
                const displayScores = scoreAllActions.aggregatedScore.key;
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
                            {isRowExpanded && (
                                <React.Fragment>
                                    <br />
                                    <br />
                                    <TurnoverComponent
                                        decimals={props.decimals}
                                        turnover={scoreAllActions.turnover}
                                    />
                                </React.Fragment>
                            )}
                        </span>
                        {Object.values(scoreAllActions.allActions).map((scoreAction) => {
                            return (
                                <span
                                    style={{
                                        ...spanStyle,
                                        backgroundColor: actionColors[scoreAction.action]
                                    }}
                                    key={scoreAction.dealerCard.symbol}
                                >
                                    {scoreAction.action.substring(0, 1)}
                                    {isRowExpanded && (
                                        <React.Fragment>
                                            <br />
                                            <br />
                                            <TurnoverComponent
                                                decimals={props.decimals}
                                                turnover={scoreAction.turnover}
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
