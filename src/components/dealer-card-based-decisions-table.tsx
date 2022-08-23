import React, { CSSProperties, useState } from 'react';
import { displayProbabilityTotals, maximumScore } from '../constants';
import { getPlayerScoreStats } from '../logic';
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
    displayAdditionalProbabilities: boolean;
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
            Loss: <RoundedFloat value={props.playerProbabilities.lossProbability} />
            <br />
            Push: <RoundedFloat value={props.playerProbabilities.pushProbability} />
            <br />
            Win: <RoundedFloat value={props.playerProbabilities.winProbability} />
            <br />
            {displayProbabilityTotals && (
                <React.Fragment>
                    Total: <RoundedFloat value={props.playerProbabilities.totalProbability} />
                    <br />
                </React.Fragment>
            )}
            <br />
            Player advantage:{' '}
            <RoundedFloat
                value={
                    props.playerProbabilities.winProbability -
                    props.playerProbabilities.lossProbability
                }
            />
            <br />
            Player advantage (payout):{' '}
            <RoundedFloat value={props.playerProbabilities.payoutRatio - 1} />
            <br />
            <br />
            <div style={{ display: 'flex', width: '100%' }}>
                <div
                    style={{
                        ...cellStyle,
                        borderLeft: '1px solid black',
                        borderTop: '1px solid black'
                    }}
                ></div>
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
            {getPlayerScoreStats(props.allScoreStats).map((scoreStats) => {
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
                            {isRowExpanded && (
                                <React.Fragment>
                                    <br />
                                    Loss:{' '}
                                    <RoundedFloat
                                        value={
                                            props.playerProbabilities.facts[scoreStats.key]
                                                .lossProbability
                                        }
                                    />
                                    <br />
                                    Push:{' '}
                                    <RoundedFloat
                                        value={
                                            props.playerProbabilities.facts[scoreStats.key]
                                                .pushProbability
                                        }
                                    />
                                    <br />
                                    Win:{' '}
                                    <RoundedFloat
                                        value={
                                            props.playerProbabilities.facts[scoreStats.key]
                                                .winProbability
                                        }
                                    />
                                    {displayProbabilityTotals && (
                                        <React.Fragment>
                                            <br />
                                            Total:{' '}
                                            <RoundedFloat
                                                value={
                                                    props.playerProbabilities.facts[scoreStats.key]
                                                        .totalProbability
                                                }
                                            />
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                        {props.outcomesSet.allOutcomes.map((cardOutcome) => (
                            <div
                                key={cardOutcome.symbol}
                                style={{
                                    ...cellStyle,
                                    ...(props.playerProbabilities.facts[scoreStats.key].facts[
                                        cardOutcome.key
                                    ].decision === PlayerDecision.hit
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
                                        props.playerProbabilities.facts[scoreStats.key].facts[
                                            cardOutcome.key
                                        ].decision
                                    }
                                    {isRowExpanded && (
                                        <React.Fragment>
                                            <br />
                                            Loss:{' '}
                                            <RoundedFloat
                                                value={
                                                    props.playerProbabilities.facts[scoreStats.key]
                                                        .facts[cardOutcome.key][
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key].decision
                                                    ].actionOutcome.lossProbability
                                                }
                                            />
                                            <br />
                                            Push:{' '}
                                            <RoundedFloat
                                                value={
                                                    props.playerProbabilities.facts[scoreStats.key]
                                                        .facts[cardOutcome.key][
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key].decision
                                                    ].actionOutcome.pushProbability
                                                }
                                            />
                                            <br />
                                            Win:{' '}
                                            <RoundedFloat
                                                value={
                                                    props.playerProbabilities.facts[scoreStats.key]
                                                        .facts[cardOutcome.key][
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key].decision
                                                    ].actionOutcome.winProbability
                                                }
                                            />
                                            {displayProbabilityTotals && (
                                                <React.Fragment>
                                                    <br />
                                                    Total:{' '}
                                                    <RoundedFloat
                                                        value={
                                                            props.playerProbabilities.facts[
                                                                scoreStats.key
                                                            ].facts[cardOutcome.key][
                                                                props.playerProbabilities.facts[
                                                                    scoreStats.key
                                                                ].facts[cardOutcome.key].decision
                                                            ].actionOutcome.totalProbability
                                                        }
                                                    />
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}
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
                                                props.playerProbabilities.facts[scoreStats.key]
                                                    .facts[cardOutcome.key]
                                                    .standLessThanDealerProbability
                                            }
                                        />
                                        {props.displayAdditionalProbabilities && (
                                            <React.Fragment>
                                                <br />
                                                {`P(= D): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key]
                                                            .standEqualToDealerProbability
                                                    }
                                                />
                                                <br />
                                                {`P(> D): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key]
                                                            .standMoreThanDealerProbability
                                                    }
                                                />
                                                <br />
                                                {`D(>${maximumScore}): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key]
                                                            .standDealerBustingProbability
                                                    }
                                                />
                                                {displayProbabilityTotals && (
                                                    <React.Fragment>
                                                        <br />
                                                        Total:{' '}
                                                        <RoundedFloat
                                                            value={
                                                                props.playerProbabilities.facts[
                                                                    scoreStats.key
                                                                ].facts[cardOutcome.key]
                                                                    .standTotalProbability
                                                            }
                                                        />
                                                    </React.Fragment>
                                                )}
                                            </React.Fragment>
                                        )}
                                        <br />
                                        <br />
                                        Hit -------
                                        <br />
                                        {`P(>${maximumScore}): `}
                                        <RoundedFloat
                                            value={
                                                props.playerProbabilities.facts[scoreStats.key]
                                                    .facts[cardOutcome.key].hitBustingProbability
                                            }
                                        />
                                        <br />
                                        {`P(< D): `}
                                        <RoundedFloat
                                            value={
                                                props.playerProbabilities.facts[scoreStats.key]
                                                    .facts[cardOutcome.key]
                                                    .hitLessThanDealerProbability
                                            }
                                        />
                                        {props.displayAdditionalProbabilities && (
                                            <React.Fragment>
                                                <br />
                                                {`P(= D): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key]
                                                            .hitEqualToDealerProbability
                                                    }
                                                />
                                                <br />
                                                {`P(> D): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key]
                                                            .hitMoreThanDealerProbability
                                                    }
                                                />
                                                <br />
                                                {`D(>21): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key]
                                                            .hitDealerBustingProbability
                                                    }
                                                />
                                                {displayProbabilityTotals && (
                                                    <React.Fragment>
                                                        <br />
                                                        Total:{' '}
                                                        <RoundedFloat
                                                            value={
                                                                props.playerProbabilities.facts[
                                                                    scoreStats.key
                                                                ].facts[cardOutcome.key]
                                                                    .hitTotalProbability
                                                            }
                                                        />
                                                    </React.Fragment>
                                                )}
                                            </React.Fragment>
                                        )}
                                        {scoreStats.representativeHand.allScores.length > 1 && (
                                            <React.Fragment>
                                                <br />
                                                <br />
                                                {`P(<${scoreStats.representativeHand.effectiveScore}): `}
                                                <RoundedFloat
                                                    value={
                                                        props.playerProbabilities.facts[
                                                            scoreStats.key
                                                        ].facts[cardOutcome.key]
                                                            .hitLessThanCurrentProbability
                                                    }
                                                />
                                            </React.Fragment>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            })}
            <p>P({'<'} D) = probability of getting a score lower than dealer's</p>
            <p>P({'>'}21) = probability of busting</p>
            {props.displayAdditionalProbabilities && (
                <React.Fragment>
                    <p>P({'≥'} D) = probability of getting a score equal or higher than dealer's</p>
                    <p>D({'>'}21) = probability of dealer busting</p>
                </React.Fragment>
            )}
            <p>P({'<'} X) = probability of getting a score lower than X (only soft hands)</p>
            <p>Loss = Probability of player losing</p>
        </div>
    );
};
