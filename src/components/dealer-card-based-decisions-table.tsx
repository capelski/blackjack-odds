import React, { CSSProperties, useMemo, useState } from 'react';
import { Column, CellProps } from 'react-table';
import { displayProbabilityTotals, probabilityLabels } from '../constants';
import { getPlayerScoreStats } from '../logic';
import { PlayerDecision, ScoreKey } from '../models';
import {
    AllScoreDealerCardBasedProbabilities,
    ExpandedRows,
    OutcomesSet,
    PlayerDecisionsOverrides,
    ScoreStats
} from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface DealerCardBasedDecisionsTableProps {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
    playerDecisionsEdit: boolean;
    playerDecisionsOverrides: PlayerDecisionsOverrides;
    playerDecisionsOverridesSetter: (playerDecisionsOverride: PlayerDecisionsOverrides) => void;
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
                                    {probabilityLabels.playerLoss}:{' '}
                                    <RoundedFloat value={facts.lossProbability} />
                                    <br />
                                    {probabilityLabels.playerPush}:{' '}
                                    <RoundedFloat value={facts.pushProbability} />
                                    <br />
                                    {probabilityLabels.playerWin}:{' '}
                                    <RoundedFloat value={facts.winProbability} />
                                    {displayProbabilityTotals && (
                                        <React.Fragment>
                                            <br />
                                            {probabilityLabels.playerTotal}:{' '}
                                            <RoundedFloat value={facts.totalProbability} />
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
                    const isRowExpanded = expandedRows[scoreKey];

                    return (
                        <div key={cardOutcome.symbol}>
                            <div>
                                {props.playerDecisionsEdit ? (
                                    <select
                                        onChange={(event) => {
                                            props.playerDecisionsOverridesSetter({
                                                ...props.playerDecisionsOverrides,
                                                [scoreKey]: {
                                                    ...props.playerDecisionsOverrides[scoreKey],
                                                    [cardOutcome.key]: event.target
                                                        .value as PlayerDecision
                                                }
                                            });
                                        }}
                                        value={dealerCardFacts.choice}
                                    >
                                        {Object.values(PlayerDecision).map((playerDecision) => (
                                            <option key={playerDecision} value={playerDecision}>
                                                {playerDecision}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    dealerCardFacts.choice
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
                                    {Object.values(PlayerDecision).map((playerDecision) => {
                                        const { decisionOutcome, decisionProbabilities } =
                                            dealerCardFacts.decisions[playerDecision];
                                        return (
                                            <React.Fragment>
                                                {playerDecision} -------
                                                <br />
                                                {`${probabilityLabels.playerBusting}: `}
                                                <RoundedFloat
                                                    value={decisionProbabilities.playerBusting}
                                                />
                                                <br />
                                                {`${probabilityLabels.dealerBusting}: `}
                                                <RoundedFloat
                                                    value={decisionProbabilities.dealerBusting}
                                                />
                                                <br />
                                                {`${probabilityLabels.playerLessThanDealer}: `}
                                                <RoundedFloat
                                                    value={
                                                        decisionProbabilities.playerLessThanDealer
                                                    }
                                                />
                                                <br />
                                                {`${probabilityLabels.playerEqualToDealer}: `}
                                                <RoundedFloat
                                                    value={
                                                        decisionProbabilities.playerEqualToDealer
                                                    }
                                                />
                                                <br />
                                                {`${probabilityLabels.playerMoreThanDealer}: `}
                                                <RoundedFloat
                                                    value={
                                                        decisionProbabilities.playerMoreThanDealer
                                                    }
                                                />
                                                {displayProbabilityTotals && (
                                                    <React.Fragment>
                                                        <br />
                                                        Total:{' '}
                                                        <RoundedFloat
                                                            value={decisionProbabilities.total}
                                                        />
                                                    </React.Fragment>
                                                )}
                                                {representativeHand.allScores.length > 1 && (
                                                    <i>
                                                        <br />
                                                        {`${probabilityLabels.playerLessThanCurrent(
                                                            representativeHand.effectiveScore
                                                        )}: `}
                                                        <RoundedFloat
                                                            value={
                                                                decisionProbabilities.playerLessThanCurrent
                                                            }
                                                        />
                                                    </i>
                                                )}
                                                <br />
                                                <br />
                                                {probabilityLabels.playerLoss}:{' '}
                                                <RoundedFloat
                                                    value={decisionOutcome.lossProbability}
                                                />
                                                <br />
                                                {probabilityLabels.playerPush}:{' '}
                                                <RoundedFloat
                                                    value={decisionOutcome.pushProbability}
                                                />
                                                <br />
                                                {probabilityLabels.playerWin}:{' '}
                                                <RoundedFloat
                                                    value={decisionOutcome.winProbability}
                                                />
                                                {displayProbabilityTotals && (
                                                    <React.Fragment>
                                                        <br />
                                                        {probabilityLabels.playerTotal}:{' '}
                                                        <RoundedFloat
                                                            value={decisionOutcome.totalProbability}
                                                        />
                                                    </React.Fragment>
                                                )}
                                                <br />
                                                <br />
                                            </React.Fragment>
                                        );
                                    })}
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
        props.outcomesSet,
        props.playerDecisionsEdit,
        props.playerDecisionsOverrides,
        props.playerProbabilities
    ]);

    return (
        <div>
            {probabilityLabels.playerLoss}:{' '}
            <RoundedFloat value={props.playerProbabilities.lossProbability} />
            <br />
            {probabilityLabels.playerPush}:{' '}
            <RoundedFloat value={props.playerProbabilities.pushProbability} />
            <br />
            {probabilityLabels.playerWin}:{' '}
            <RoundedFloat value={props.playerProbabilities.winProbability} />
            <br />
            {displayProbabilityTotals && (
                <React.Fragment>
                    {probabilityLabels.playerTotal}:{' '}
                    <RoundedFloat value={props.playerProbabilities.totalProbability} />
                    <br />
                </React.Fragment>
            )}
            <br />
            {probabilityLabels.playerAdvantageHands}:{' '}
            <RoundedFloat value={props.playerProbabilities.playerAdvantage.hands} />
            <br />
            {probabilityLabels.playerAdvantagePayout}:{' '}
            <RoundedFloat value={props.playerProbabilities.playerAdvantage.payout} />
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
                        ? scoreFacts.facts[dealerCardKey].choice === PlayerDecision.hit
                            ? {
                                  backgroundColor: 'rgb(66, 139, 202)',
                                  color: 'white'
                              }
                            : {
                                  backgroundColor: 'rgb(92, 184, 92)'
                              }
                        : {};

                    return {
                        border:
                            dealerCardKey && props.playerDecisionsOverrides[key]?.[dealerCardKey]
                                ? '2px solid coral'
                                : '1px solid black',
                        padding: 0,
                        ...actionStyles
                    };
                }}
                data={data}
                width="100%"
            />
            <p>{probabilityLabels.playerBusting} = probability of player busting</p>
            <p>{probabilityLabels.dealerBusting} = probability of dealer busting</p>
            <p>
                {probabilityLabels.playerLessThanDealer} = probability of player getting a score
                lower than dealer's score
            </p>
            <p>
                {probabilityLabels.playerEqualToDealer} = probability of player getting the same
                score as dealer's score
            </p>
            <p>
                {probabilityLabels.playerMoreThanDealer} = probability of player getting a score
                higher than dealer's score
            </p>
            <p>
                {probabilityLabels.playerLessThanCurrent('X')} = probability of player getting a
                score lower than X (only soft hands)
            </p>
            <p>
                {probabilityLabels.playerLoss} = probability of player losing (i.e.{' '}
                {probabilityLabels.playerBusting} + {probabilityLabels.playerLessThanDealer} )
            </p>
            <p>
                {probabilityLabels.playerPush} = probability of player pushing (i.e.{' '}
                {probabilityLabels.playerEqualToDealer} )
            </p>
            <p>
                {probabilityLabels.playerWin} = probability of player winning (i.e.{' '}
                {probabilityLabels.dealerBusting} + {probabilityLabels.playerMoreThanDealer} )
            </p>
            <p>
                {probabilityLabels.playerAdvantageHands} = probability of winning hands on the long
                run (i.e. {probabilityLabels.playerWin} - {probabilityLabels.playerLoss} )
            </p>
            <p>
                {probabilityLabels.playerAdvantagePayout} = probability of winning money on the long
                run (i.e. {probabilityLabels.playerWin} * winPayout - {probabilityLabels.playerLoss}{' '}
                )
            </p>
        </div>
    );
};
