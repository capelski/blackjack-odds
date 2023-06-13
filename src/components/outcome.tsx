import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { colors, desktopBreakpoint, displayProbabilityTotals, labels } from '../constants';
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
                    {...colors.win}
                    name={labels.win}
                    value={props.outcome?.winProbability || 0}
                />
                <OutcomeBadge
                    {...colors.loss}
                    name={labels.loss}
                    value={props.outcome?.lossProbability || 0}
                />
                <OutcomeBadge
                    {...colors.push}
                    name={labels.push}
                    value={props.outcome?.pushProbability || 0}
                />
                <OutcomeBadge
                    {...colors.advantage}
                    name={labels.advantage}
                    value={props.outcome?.playerAdvantage.hands || 0}
                />
                <OutcomeBadge
                    {...colors.payout}
                    name={labels.payout}
                    value={props.outcome?.playerAdvantage.payout || 0}
                />
            </div>

            {displayProbabilityTotals && (
                <p>
                    Total: <RoundedFloat value={props.outcome?.totalProbability || 0} />
                </p>
            )}
        </React.Fragment>
    );
};
