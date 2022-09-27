import React, { CSSProperties, useMemo, useState } from 'react';
import { Column, CellProps } from 'react-table';
import { displayProbabilityTotals, probabilityLabels } from '../constants';
import { getDisplayPlayerDecision, getPlayerScoreStats, isVisibleDecision } from '../logic';
import { PlayerDecision, ScoreKey } from '../models';
import {
    AllScoreStatsChoicesSummary,
    ExpandedRows,
    OutcomesSet,
    PlayerDecisionsOverrides,
    ScoreStats
} from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface ScoreStatsChoicesTableProps {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
    playerChoices: AllScoreStatsChoicesSummary;
    playerDecisionsEdit: boolean;
    playerDecisionsOverrides: PlayerDecisionsOverrides;
    playerDecisionsOverridesSetter: (playerDecisionsOverride: PlayerDecisionsOverrides) => void;
}

export const ScoreStatsChoicesTable: React.FC<ScoreStatsChoicesTableProps> = (props) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const { columns, data } = useMemo(() => {
        const columns: Column<ScoreStats>[] = [
            {
                Cell: (cellProps: CellProps<ScoreStats>) => {
                    const { key } = cellProps.row.original;
                    const scoreStatsChoice = props.playerChoices.choices[key];
                    /* scoreStatsChoice might be undefined during settings re-processing */
                    const decisionOutcome = scoreStatsChoice?.decisionOutcome;
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
                            {isRowExpanded && decisionOutcome && (
                                <React.Fragment>
                                    <br />
                                    {probabilityLabels.playerLoss}:{' '}
                                    <RoundedFloat value={decisionOutcome.lossProbability} />
                                    <br />
                                    {probabilityLabels.playerPush}:{' '}
                                    <RoundedFloat value={decisionOutcome.pushProbability} />
                                    <br />
                                    {probabilityLabels.playerWin}:{' '}
                                    <RoundedFloat value={decisionOutcome.winProbability} />
                                    <br />
                                    {probabilityLabels.playerAdvantageHands}:{' '}
                                    <RoundedFloat value={decisionOutcome.playerAdvantage.hands} />
                                    <br />
                                    {probabilityLabels.playerAdvantagePayout}:{' '}
                                    <RoundedFloat value={decisionOutcome.playerAdvantage.payout} />
                                    {displayProbabilityTotals && (
                                        <React.Fragment>
                                            <br />
                                            {probabilityLabels.playerTotal}:{' '}
                                            <RoundedFloat
                                                value={decisionOutcome.totalProbability}
                                            />
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
                    const scoreStatsChoice = props.playerChoices.choices[scoreKey];

                    /* scoreStatsChoice might be undefined during settings re-processing */
                    if (!scoreStatsChoice) {
                        return <div key={cardOutcome.symbol}>-</div>;
                    }

                    const { choice, decisions } =
                        scoreStatsChoice.dealerCardChoices[cardOutcome.key];
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
                                        value={choice}
                                    >
                                        {Object.keys(decisions)
                                            .filter(
                                                (playerDecision: PlayerDecision) =>
                                                    decisions[playerDecision].available
                                            )
                                            .map((playerDecision) => (
                                                <option key={playerDecision} value={playerDecision}>
                                                    {playerDecision}
                                                </option>
                                            ))}
                                    </select>
                                ) : (
                                    choice
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
                                    {Object.keys(decisions)
                                        .filter(
                                            (playerDecision: PlayerDecision) =>
                                                decisions[playerDecision].available &&
                                                isVisibleDecision(playerDecision)
                                        )
                                        .map((playerDecision: PlayerDecision) => {
                                            const { outcome, probabilityBreakdown } =
                                                decisions[playerDecision];
                                            return (
                                                <React.Fragment key={playerDecision}>
                                                    {getDisplayPlayerDecision(playerDecision)}{' '}
                                                    -------
                                                    <br />
                                                    {`${probabilityLabels.playerBusting}: `}
                                                    <RoundedFloat
                                                        value={probabilityBreakdown.playerBusting}
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.dealerBusting}: `}
                                                    <RoundedFloat
                                                        value={probabilityBreakdown.dealerBusting}
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.playerLessThanDealer}: `}
                                                    <RoundedFloat
                                                        value={
                                                            probabilityBreakdown.playerLessThanDealer
                                                        }
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.playerEqualToDealer}: `}
                                                    <RoundedFloat
                                                        value={
                                                            probabilityBreakdown.playerEqualToDealer
                                                        }
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.playerMoreThanDealer}: `}
                                                    <RoundedFloat
                                                        value={
                                                            probabilityBreakdown.playerMoreThanDealer
                                                        }
                                                    />
                                                    {displayProbabilityTotals && (
                                                        <React.Fragment>
                                                            <br />
                                                            Total:{' '}
                                                            <RoundedFloat
                                                                value={probabilityBreakdown.total}
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
                                                                    probabilityBreakdown.playerLessThanCurrent
                                                                }
                                                            />
                                                        </i>
                                                    )}
                                                    <br />
                                                    <br />
                                                    {probabilityLabels.playerLoss}:{' '}
                                                    <RoundedFloat value={outcome.lossProbability} />
                                                    <br />
                                                    {probabilityLabels.playerPush}:{' '}
                                                    <RoundedFloat value={outcome.pushProbability} />
                                                    <br />
                                                    {probabilityLabels.playerWin}:{' '}
                                                    <RoundedFloat value={outcome.winProbability} />
                                                    <br />
                                                    {probabilityLabels.playerAdvantageHands}:{' '}
                                                    <RoundedFloat
                                                        value={outcome.playerAdvantage.hands}
                                                    />
                                                    <br />
                                                    {probabilityLabels.playerAdvantagePayout}:{' '}
                                                    <RoundedFloat
                                                        value={outcome.playerAdvantage.payout}
                                                    />
                                                    {displayProbabilityTotals && (
                                                        <React.Fragment>
                                                            <br />
                                                            {probabilityLabels.playerTotal}:{' '}
                                                            <RoundedFloat
                                                                value={outcome.totalProbability}
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
        props.playerChoices,
        props.playerDecisionsEdit,
        props.playerDecisionsOverrides
    ]);

    return (
        <div>
            {probabilityLabels.playerLoss}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.lossProbability} />
            <br />
            {probabilityLabels.playerPush}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.pushProbability} />
            <br />
            {probabilityLabels.playerWin}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.winProbability} />
            <br />
            {displayProbabilityTotals && (
                <React.Fragment>
                    {probabilityLabels.playerTotal}:{' '}
                    <RoundedFloat value={props.playerChoices.outcome.totalProbability} />
                    <br />
                </React.Fragment>
            )}
            <br />
            {probabilityLabels.playerAdvantageHands}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.playerAdvantage.hands} />
            <br />
            {probabilityLabels.playerAdvantagePayout}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.playerAdvantage.payout} />
            <br />
            <br />
            <CustomTable
                columns={columns}
                columnStyle={(cellProps) => {
                    const baseStyles: CSSProperties = {
                        border: '1px solid black',
                        padding: 0
                    };
                    const { key } = cellProps.row.original;
                    const dealerCardKey =
                        cellProps.column.id === 'score'
                            ? undefined
                            : (cellProps.column.id as ScoreKey);
                    const scoreStatsChoice = props.playerChoices.choices[key];

                    /* scoreStatsChoice might be undefined during settings re-processing */
                    if (!scoreStatsChoice || !dealerCardKey) {
                        return baseStyles;
                    }

                    if (props.playerDecisionsOverrides[key]?.[dealerCardKey]) {
                        baseStyles.border = '2px solid coral';
                    }

                    const { choice } = scoreStatsChoice.dealerCardChoices[dealerCardKey];
                    const actionStyles: CSSProperties =
                        choice === PlayerDecision.doubleHit
                            ? {
                                  backgroundColor: 'goldenrod',
                                  color: 'black'
                              }
                            : choice === PlayerDecision.doubleStand
                            ? {
                                  backgroundColor: 'darkgoldenrod',
                                  color: 'black'
                              }
                            : choice === PlayerDecision.hit
                            ? {
                                  backgroundColor: 'rgb(66, 139, 202)',
                                  color: 'white'
                              }
                            : choice === PlayerDecision.splitHit
                            ? {
                                  backgroundColor: '#9A6F93',
                                  color: 'white'
                              }
                            : choice === PlayerDecision.splitStand
                            ? {
                                  backgroundColor: '#80567A',
                                  color: 'white'
                              }
                            : choice === PlayerDecision.stand
                            ? {
                                  backgroundColor: 'rgb(92, 184, 92)'
                              }
                            : {};

                    return {
                        ...baseStyles,
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
                * lossCost )
            </p>
        </div>
    );
};