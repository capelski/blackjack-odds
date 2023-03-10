import React from 'react';
import { useMediaQuery } from 'react-responsive';
import {
    probabilityLabels,
    displayProbabilityTotals,
    desktopBreakpoint,
    colors
} from '../constants';
import { VsDealerOutcome } from '../types';
import { OutcomeBadge } from './outcome-badge';
import { RoundedFloat } from './rounded-float';

interface OutcomeComponentProps {
    outcome?: VsDealerOutcome;
}

export const OutcomeComponent: React.FC<OutcomeComponentProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    return (
        <React.Fragment>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isDesktop ? 'repeat(5, 1fr)' : 'repeat(2, 1fr)'
                }}
            >
                <OutcomeBadge
                    {...colors.payout}
                    name="payout (€)"
                    value={props.outcome?.playerAdvantage.payout || 0}
                />
                <OutcomeBadge
                    {...colors.advantage}
                    name="advantage (win - loss)"
                    value={props.outcome?.playerAdvantage.hands || 0}
                />
                <OutcomeBadge
                    {...colors.win}
                    name="winning hands"
                    value={props.outcome?.winProbability || 0}
                />
                <OutcomeBadge
                    {...colors.loss}
                    name="losing hands"
                    value={props.outcome?.lossProbability || 0}
                />
                <OutcomeBadge
                    {...colors.push}
                    name="pushing hands"
                    value={props.outcome?.pushProbability || 0}
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
