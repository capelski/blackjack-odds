import React from 'react';
import { probabilityLabels, displayProbabilityTotals } from '../constants';
import { getPrimaryPlayerDecisions, getDisplayPlayerDecision } from '../logic';
import { PlayerDecision } from '../models';
import { AllDecisionsData, ScoreStats } from '../types';
import { RoundedFloat } from './rounded-float';

interface DecisionsProbabilityBreakdownProps {
    decisions: AllDecisionsData;
    scoreStats: ScoreStats;
}

export const DecisionsProbabilityBreakdown: React.FC<DecisionsProbabilityBreakdownProps> = (
    props
) => {
    return (
        <React.Fragment>
            {getPrimaryPlayerDecisions(props.decisions).map((playerDecision: PlayerDecision) => {
                const { outcome, probabilityBreakdown } = props.decisions[playerDecision];
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
                        <RoundedFloat value={probabilityBreakdown.playerLessThanDealer} />
                        <br />
                        {`${probabilityLabels.playerEqualToDealer}: `}
                        <RoundedFloat value={probabilityBreakdown.playerEqualToDealer} />
                        <br />
                        {`${probabilityLabels.playerMoreThanDealer}: `}
                        <RoundedFloat value={probabilityBreakdown.playerMoreThanDealer} />
                        {displayProbabilityTotals && (
                            <React.Fragment>
                                <br />
                                Total: <RoundedFloat value={probabilityBreakdown.total} />
                            </React.Fragment>
                        )}
                        {props.scoreStats.representativeHand.allScores.length > 1 && (
                            <i>
                                <br />
                                {`${probabilityLabels.playerLessThanCurrent(
                                    props.scoreStats.representativeHand.effectiveScore
                                )}: `}
                                <RoundedFloat value={probabilityBreakdown.playerLessThanCurrent} />
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
            })}
        </React.Fragment>
    );
};
