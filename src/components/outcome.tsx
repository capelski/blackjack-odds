import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { colors, desktopBreakpoint, displayProbabilityTotals, labels } from '../constants';
import { VsDealerOutcome } from '../types';
import { Badge } from './badge';
import { OutcomeBadge } from './outcome-badge';
import { RoundedFloat } from './rounded-float';

interface OutcomeComponentProps {
    outcome?: VsDealerOutcome;
}

export const OutcomeComponent: React.FC<OutcomeComponentProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    // const advantageRatio = props.outcome
    //     ? props.outcome.winProbability /
    //       (props.outcome.winProbability + props.outcome.lossProbability)
    //     : 0;
    const payoutRatio = props.outcome
        ? (props.outcome.winProbability * props.outcome.winPayout) /
          (props.outcome.lossProbability * props.outcome.lossPayout || 1)
        : 0;

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
                <Badge {...colors.advantage}>
                    <div>{labels.advantage}</div>
                    <div>
                        <span style={{ fontSize: 24 }}>
                            <RoundedFloat
                                isPercentage={false}
                                value={props.outcome?.playerAdvantage.hands || 0}
                            />
                            :1
                        </span>
                    </div>
                </Badge>
                <Badge {...colors.payout}>
                    <div>{labels.payout}</div>
                    <div>
                        <span style={{ fontSize: 24 }}>
                            <RoundedFloat isPercentage={false} value={payoutRatio} />
                            :1
                        </span>
                    </div>
                </Badge>
            </div>

            {displayProbabilityTotals && (
                <p>
                    Total: <RoundedFloat value={props.outcome?.totalProbability || 0} />
                </p>
            )}
        </React.Fragment>
    );
};
