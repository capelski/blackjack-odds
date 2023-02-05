import React from 'react';
import { probabilityLabels, displayProbabilityTotals } from '../constants';
import { DecisionOutcome } from '../types';
import { OutcomeBadge } from './outcome-badge';
import { RoundedFloat } from './rounded-float';

interface OutcomeComponentProps {
    outcome?: DecisionOutcome;
}

export const OutcomeComponent: React.FC<OutcomeComponentProps> = (props) => {
    return (
        <React.Fragment>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <OutcomeBadge
                    backgroundColor="#5cb85c"
                    name="winning hands"
                    value={props.outcome?.winProbability || 0}
                />
                <OutcomeBadge
                    backgroundColor="#f0ad4e"
                    name="pushing hands"
                    value={props.outcome?.pushProbability || 0}
                />
                <OutcomeBadge
                    backgroundColor="#d9534f"
                    name="losing hands"
                    value={props.outcome?.lossProbability || 0}
                />
                <OutcomeBadge
                    color="black"
                    name="advantage (win - loss)"
                    value={props.outcome?.playerAdvantage.hands || 0}
                />
                <OutcomeBadge
                    backgroundColor="#428bca"
                    name="payout (€)"
                    value={props.outcome?.playerAdvantage.payout || 0}
                />
            </div>

            {displayProbabilityTotals && (
                <p>
                    {probabilityLabels.playerTotal}:{' '}
                    <RoundedFloat value={props.outcome?.totalProbability || 0} />
                </p>
            )}
        </React.Fragment>
    );
};
