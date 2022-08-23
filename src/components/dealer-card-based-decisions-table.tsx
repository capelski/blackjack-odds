import React, { CSSProperties, useMemo, useState } from 'react';
import { Column, CellProps } from 'react-table';
import { displayProbabilityTotals, maximumScore } from '../constants';
import { getPlayerScoreStats } from '../logic';
import { PlayerDecision, ScoreKey } from '../models';
import {
    AllScoreDealerCardBasedProbabilities,
    ExpandedRows,
    OutcomesSet,
    ScoreStats
} from '../types';
import { CustomTable } from './custom-table';
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
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const { columns, data } = useMemo(() => {
        const columns: Column<ScoreStats>[] = [
            {
                Cell: (cellProps: CellProps<ScoreStats>) => {
                    const { key } = cellProps.row.original;
                    const facts = props.playerProbabilities.facts[key];
                    const isRowExpanded = expandedRows[key];
                    return (
                        <div>
                            {key}{' '}
                            <span
                                onClick={() => {
                                    setExpandedRows({
                                        ...expandedRows,
                                        [key]: !isRowExpanded
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
                                    Loss: <RoundedFloat value={facts.lossProbability} />
                                    <br />
                                    Push: <RoundedFloat value={facts.pushProbability} />
                                    <br />
                                    Win: <RoundedFloat value={facts.winProbability} />
                                    {displayProbabilityTotals && (
                                        <React.Fragment>
                                            <br />
                                            Total: <RoundedFloat value={facts.totalProbability} />
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    );
                },
                Header: 'Score',
                id: 'score'
            },
            ...props.outcomesSet.allOutcomes.map((cardOutcome) => ({
                Cell: (cellProps: CellProps<ScoreStats>) => {
                    const { key: scoreKey, representativeHand } = cellProps.row.original;
                    const scoreFacts = props.playerProbabilities.facts[scoreKey];
                    const dealerCardFacts = scoreFacts.facts[cardOutcome.key];
                    const { actionOutcome: dealerCardActionOutcome } =
                        dealerCardFacts[dealerCardFacts.decision];
                    const isRowExpanded = expandedRows[scoreKey];

                    return (
                        <div key={cardOutcome.symbol}>
                            <div style={{ textTransform: 'capitalize' }}>
                                {dealerCardFacts.decision}
                                {isRowExpanded && (
                                    <React.Fragment>
                                        <br />
                                        Loss:{' '}
                                        <RoundedFloat
                                            value={dealerCardActionOutcome.lossProbability}
                                        />
                                        <br />
                                        Push:{' '}
                                        <RoundedFloat
                                            value={dealerCardActionOutcome.pushProbability}
                                        />
                                        <br />
                                        Win:{' '}
                                        <RoundedFloat
                                            value={dealerCardActionOutcome.winProbability}
                                        />
                                        {displayProbabilityTotals && (
                                            <React.Fragment>
                                                <br />
                                                Total:{' '}
                                                <RoundedFloat
                                                    value={dealerCardActionOutcome.totalProbability}
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
                                        value={dealerCardFacts.standLessThanDealerProbability}
                                    />
                                    {props.displayAdditionalProbabilities && (
                                        <React.Fragment>
                                            <br />
                                            {`P(= D): `}
                                            <RoundedFloat
                                                value={
                                                    dealerCardFacts.standEqualToDealerProbability
                                                }
                                            />
                                            <br />
                                            {`P(> D): `}
                                            <RoundedFloat
                                                value={
                                                    dealerCardFacts.standMoreThanDealerProbability
                                                }
                                            />
                                            <br />
                                            {`D(>${maximumScore}): `}
                                            <RoundedFloat
                                                value={
                                                    dealerCardFacts.standDealerBustingProbability
                                                }
                                            />
                                            {displayProbabilityTotals && (
                                                <React.Fragment>
                                                    <br />
                                                    Total:{' '}
                                                    <RoundedFloat
                                                        value={
                                                            dealerCardFacts.standTotalProbability
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
                                    <RoundedFloat value={dealerCardFacts.hitBustingProbability} />
                                    <br />
                                    {`P(< D): `}
                                    <RoundedFloat
                                        value={dealerCardFacts.hitLessThanDealerProbability}
                                    />
                                    {props.displayAdditionalProbabilities && (
                                        <React.Fragment>
                                            <br />
                                            {`P(= D): `}
                                            <RoundedFloat
                                                value={dealerCardFacts.hitEqualToDealerProbability}
                                            />
                                            <br />
                                            {`P(> D): `}
                                            <RoundedFloat
                                                value={dealerCardFacts.hitMoreThanDealerProbability}
                                            />
                                            <br />
                                            {`D(>21): `}
                                            <RoundedFloat
                                                value={dealerCardFacts.hitDealerBustingProbability}
                                            />
                                            {displayProbabilityTotals && (
                                                <React.Fragment>
                                                    <br />
                                                    Total:{' '}
                                                    <RoundedFloat
                                                        value={dealerCardFacts.hitTotalProbability}
                                                    />
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    )}
                                    {representativeHand.allScores.length > 1 && (
                                        <React.Fragment>
                                            <br />
                                            <br />
                                            {`P(<${representativeHand.effectiveScore}): `}
                                            <RoundedFloat
                                                value={
                                                    dealerCardFacts.hitLessThanCurrentProbability
                                                }
                                            />
                                        </React.Fragment>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                },
                Header: cardOutcome.symbol,
                id: cardOutcome.key // The column id must be the dealer card key for columnStyle to have access to it below
            }))
        ];

        const data = getPlayerScoreStats(props.allScoreStats);

        return { columns, data };
    }, [
        expandedRows,
        props.allScoreStats,
        props.displayAdditionalProbabilities,
        props.outcomesSet,
        props.playerProbabilities
    ]);

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
            <CustomTable
                columns={columns}
                columnStyle={(cellProps) => {
                    const { key } = cellProps.row.original;
                    const scoreFacts = props.playerProbabilities.facts[key];
                    const dealerCardKey =
                        cellProps.column.id === 'score'
                            ? undefined
                            : (cellProps.column.id as ScoreKey);
                    const actionStyles: CSSProperties = dealerCardKey
                        ? scoreFacts.facts[dealerCardKey].decision === PlayerDecision.hit
                            ? {
                                  backgroundColor: 'rgb(66, 139, 202)',
                                  color: 'white'
                              }
                            : {
                                  backgroundColor: 'rgb(92, 184, 92)'
                              }
                        : {};

                    return {
                        border: '1px solid black',
                        padding: 0,
                        ...actionStyles
                    };
                }}
                data={data}
                width="100%"
            />
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
