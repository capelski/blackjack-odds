import React, { CSSProperties, useState } from 'react';
import { actionColors } from '../logic/constants';
import {
    AllDecisionsData,
    AllPlayerActions,
    AllTurnovers,
    ExpandedRows,
    OutcomesSet,
    PlayerAction
} from '../types';
import { TurnoverComponent } from './turnover-component';

interface PlayerActionsGridProps {
    allDecisionsData: AllDecisionsData;
    allPlayerActions: AllPlayerActions;
    allTurnovers: AllTurnovers;
    decimals: number;
    outcomesSet: OutcomesSet;
}

export const PlayerActionsGrid: React.FC<PlayerActionsGridProps> = (props) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const spanStyle: CSSProperties = {
        borderBottom: '1px solid black',
        borderRight: '1px solid black',
        textAlign: 'center',
        width: `${100 / props.outcomesSet.allOutcomes.length + 1}%`
    };

    return (
        <div>
            <TurnoverComponent decimals={props.decimals} turnover={props.allTurnovers.overall} />
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
                {props.outcomesSet.allOutcomes.map((cardOutcome) => (
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
            {Object.keys(props.allPlayerActions).map((scoreKey) => {
                const scorePlayerActions = props.allPlayerActions[scoreKey];
                const isRowExpanded = expandedRows[scoreKey];

                return (
                    <div key={scoreKey} style={{ display: 'flex', width: '100%' }}>
                        <span
                            style={{
                                ...spanStyle,
                                borderLeft: '1px solid black'
                            }}
                        >
                            {scoreKey}{' '}
                            <span
                                onClick={() => {
                                    setExpandedRows({
                                        ...expandedRows,
                                        [scoreKey]: !isRowExpanded
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
                                        turnover={props.allTurnovers.scores[scoreKey].individual}
                                    />
                                </React.Fragment>
                            )}
                        </span>
                        {Object.keys(scorePlayerActions).map((cardKey) => {
                            const playerAction: PlayerAction = scorePlayerActions[cardKey];
                            return (
                                <span
                                    style={{
                                        ...spanStyle,
                                        backgroundColor: actionColors[playerAction]
                                    }}
                                    key={cardKey}
                                >
                                    {playerAction.substring(0, 1)}
                                    {isRowExpanded && (
                                        <React.Fragment>
                                            <br />
                                            <br />
                                            <TurnoverComponent
                                                decimals={props.decimals}
                                                decisionData={
                                                    props.allDecisionsData[scoreKey][cardKey]
                                                }
                                                turnover={
                                                    props.allTurnovers.scores[scoreKey].dealerCards[
                                                        cardKey
                                                    ]
                                                }
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
