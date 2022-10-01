import React from 'react';
import { probabilityLabels, displayProbabilityTotals } from '../constants';
import { DecisionOutcome } from '../types';
import { RoundedFloat } from './rounded-float';

interface OutcomeComponentProps {
    outcome?: DecisionOutcome;
}

export const OutcomeComponent: React.FC<OutcomeComponentProps> = (props) => {
    return (
        <React.Fragment>
            {probabilityLabels.playerLoss}:{' '}
            <RoundedFloat value={props.outcome?.lossProbability || 0} />
            <br />
            {probabilityLabels.playerPush}:{' '}
            <RoundedFloat value={props.outcome?.pushProbability || 0} />
            <br />
            {probabilityLabels.playerWin}:{' '}
            <RoundedFloat value={props.outcome?.winProbability || 0} />
            <br />
            {displayProbabilityTotals && (
                <React.Fragment>
                    {probabilityLabels.playerTotal}:{' '}
                    <RoundedFloat value={props.outcome?.totalProbability || 0} />
                    <br />
                </React.Fragment>
            )}
            <br />
            {probabilityLabels.playerAdvantageHands}:{' '}
            <RoundedFloat value={props.outcome?.playerAdvantage.hands || 0} />
            <br />
            {probabilityLabels.playerAdvantagePayout}:{' '}
            <RoundedFloat value={props.outcome?.playerAdvantage.payout || 0} />
        </React.Fragment>
    );
};
