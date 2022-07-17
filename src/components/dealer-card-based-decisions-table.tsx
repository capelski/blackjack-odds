import React, { CSSProperties, useState } from 'react';
import { maximumScore } from '../constants';
import { sortScoreStats } from '../logic';
import { PlayerDecision } from '../models';
import {
    AllScoreDealerCardBasedProbabilities,
    ExpandedRows,
    OutcomesSet,
    ScoreStats
} from '../types';
import { RoundedFloat } from './rounded-float';

interface DealerCardBasedDecisionsTableProps {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
    playerProbabilities: AllScoreDealerCardBasedProbabilities;
}

export const DealerCardBasedDecisionsTable: React.FC<DealerCardBasedDecisionsTableProps> = (
    props
) => {
    const cellStyle: CSSProperties = {
        borderBottom: '1px solid black',
        borderRight: '1px solid black',
        textAlign: 'center',
        width: `${100 / props.outcomesSet.allOutcomes.length + 1}%`
    };

    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    return (
        <div>
            <div style={{ display: 'flex', width: '100%' }}>
                <div
                    style={{
                        ...cellStyle,
                        borderLeft: '1px solid black',
                        borderTop: '1px solid black'
                    }}
                >
                    -
                </div>
                {props.outcomesSet.allOutcomes.map((cardOutcome) => (
                    <div
                        style={{
                            ...cellStyle,
                            borderTop: '1px solid black'
                        }}
                        key={cardOutcome.symbol}
                    >
                        {cardOutcome.symbol}
                    </div>
                ))}
            </div>
            {sortScoreStats(props.allScoreStats).map((scoreStats) => {
                const isRowExpanded = expandedRows[scoreStats.key];
                return (
                    <div key={scoreStats.key} style={{ display: 'flex', width: '100%' }}>
                        <div
                            style={{
                                ...cellStyle,
                                borderLeft: '1px solid black'
                            }}
                        >
                            {scoreStats.key}{' '}
                            <span
                                onClick={() => {
                                    setExpandedRows({
                                        ...expandedRows,
                                        [scoreStats.key]: !isRowExpanded
                                    });
                                }}
                                style={{
                                    cursor: 'pointer'
                                }}
                            >
                                {isRowExpanded ? '✖️' : '👁️'}
                            </span>
                        </div>
                        {props.outcomesSet.allOutcomes.map((cardOutcome) => (
                            <div
                                key={cardOutcome.symbol}
                                style={{
                                    ...cellStyle,
                                    ...(props.playerProbabilities[scoreStats.key][cardOutcome.key]
                                        .decision === PlayerDecision.hit
                                        ? {
                                              backgroundColor: 'rgb(66, 139, 202)',
                                              color: 'white'
                                          }
                                        : {
                                              backgroundColor: 'rgb(92, 184, 92)'
                                          })
                                }}
                            >
                                <div style={{ textTransform: 'capitalize' }}>
                                    {
                                        props.playerProbabilities[scoreStats.key][cardOutcome.key]
                                            .decision
                                    }
                                </div>
                                {isRowExpanded && (
                                    <div
                                        style={{
                                            paddingLeft: 4,
                                            paddingTop: 16,
                                            textAlign: 'left'
                                        }}
                                    >
                                        Stand -----
                                        <br />
                                        {`P(< D): `}
                                        <RoundedFloat
                                            value={
                                                props.playerProbabilities[scoreStats.key][
                                                    cardOutcome.key
                                                ].standLessThanDealerProbability
                                            }
                                        />
                                        <br />
                                        <br />
                                        Hit -------
                                        <br />
                                        {`P(>${maximumScore}): `}
                                        <RoundedFloat
                                            value={
                                                props.playerProbabilities[scoreStats.key][
                                                    cardOutcome.key
                                                ].hitBustingProbability
                                            }
                                        />
                                        {scoreStats.representativeHand.allScores.length > 1 && (
                                            <React.Fragment>
                                                <br />
                                                {`P(<${scoreStats.representativeHand.effectiveScore}): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities[scoreStats.key][
                                                            cardOutcome.key
                                                        ].hitLessThanCurrentProbability
                                                    }
                                                />
                                            </React.Fragment>
                                        )}
                                        <br />
                                        {`P(< D): `}
                                        <RoundedFloat
                                            value={
                                                props.playerProbabilities[scoreStats.key][
                                                    cardOutcome.key
                                                ].hitLessThanDealerProbability
                                            }
                                        />
                                        <br />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            })}
            <p>P({'<'} D) = probability of dealer getting a higher score</p>
            <p>P({'>'}21) = probability of busting</p>
            <p>P({'<'} X) = probability of getting a score lower than X (only soft hands)</p>
        </div>
    );
};
