import React from 'react';
import { CellProps } from 'react-table';
import { probabilityLabels, displayProbabilityTotals } from '../constants';
import { getDisplayPlayerDecision, getPrimaryPlayerDecisions } from '../logic';
import { PlayerDecision } from '../models';
import { AllScoreStatsChoicesSummary, CardOutcome, PlayerSettings, ScoreStats } from '../types';
import { RoundedFloat } from './rounded-float';

interface ScoreStatsDealerCardChoiceCellProps {
    dealerCard: CardOutcome;
    isDesktop: boolean;
    isExpanded: boolean;
    playerChoices: AllScoreStatsChoicesSummary;
    playerDecisionsEdit: boolean;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const ScoreStatsDealerCardChoiceCell = (props: ScoreStatsDealerCardChoiceCellProps) => {
    return (cellProps: CellProps<ScoreStats>) => {
        const { key: scoreKey, representativeHand } = cellProps.row.original;
        const scoreStatsChoice = props.playerChoices.choices[scoreKey];

        /* scoreStatsChoice might be undefined during settings re-processing */
        if (!scoreStatsChoice) {
            return <div key={props.dealerCard.symbol}>-</div>;
        }

        const { choice, decisions } = scoreStatsChoice.dealerCardChoices[props.dealerCard.key];

        return (
            <div key={props.dealerCard.symbol}>
                <div>
                    {!props.processing && props.playerDecisionsEdit ? (
                        <select
                            onChange={(event) => {
                                props.playerSettingsSetter({
                                    ...props.playerSettings,
                                    playerDecisionsOverrides: {
                                        ...props.playerSettings.playerDecisionsOverrides,
                                        [scoreKey]: {
                                            ...props.playerSettings.playerDecisionsOverrides[
                                                scoreKey
                                            ],
                                            [props.dealerCard.key]: event.target
                                                .value as PlayerDecision
                                        }
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
                        getDisplayPlayerDecision(choice, { isDesktop: props.isDesktop })
                    )}
                </div>
                {props.isExpanded && (
                    <div
                        style={{
                            paddingLeft: 4,
                            paddingTop: 16,
                            textAlign: 'left'
                        }}
                    >
                        {getPrimaryPlayerDecisions(decisions).map(
                            (playerDecision: PlayerDecision) => {
                                const { outcome, probabilityBreakdown } = decisions[playerDecision];
                                return (
                                    <React.Fragment key={playerDecision}>
                                        {getDisplayPlayerDecision(playerDecision, {
                                            simplify: true
                                        })}{' '}
                                        -------
                                        <br />
                                        {`${probabilityLabels.playerBusting}: `}
                                        <RoundedFloat value={probabilityBreakdown.playerBusting} />
                                        <br />
                                        {`${probabilityLabels.dealerBusting}: `}
                                        <RoundedFloat value={probabilityBreakdown.dealerBusting} />
                                        <br />
                                        {`${probabilityLabels.playerLessThanDealer}: `}
                                        <RoundedFloat
                                            value={probabilityBreakdown.playerLessThanDealer}
                                        />
                                        <br />
                                        {`${probabilityLabels.playerEqualToDealer}: `}
                                        <RoundedFloat
                                            value={probabilityBreakdown.playerEqualToDealer}
                                        />
                                        <br />
                                        {`${probabilityLabels.playerMoreThanDealer}: `}
                                        <RoundedFloat
                                            value={probabilityBreakdown.playerMoreThanDealer}
                                        />
                                        {displayProbabilityTotals && (
                                            <React.Fragment>
                                                <br />
                                                Total:{' '}
                                                <RoundedFloat value={probabilityBreakdown.total} />
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
                                        <RoundedFloat value={outcome.playerAdvantage.hands} />
                                        <br />
                                        {probabilityLabels.playerAdvantagePayout}:{' '}
                                        <RoundedFloat value={outcome.playerAdvantage.payout} />
                                        {displayProbabilityTotals && (
                                            <React.Fragment>
                                                <br />
                                                {probabilityLabels.playerTotal}:{' '}
                                                <RoundedFloat value={outcome.totalProbability} />
                                            </React.Fragment>
                                        )}
                                        <br />
                                        <br />
                                    </React.Fragment>
                                );
                            }
                        )}
                    </div>
                )}
            </div>
        );
    };
};
