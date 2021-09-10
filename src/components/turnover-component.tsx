import React from 'react';
import { DecisionData, Turnover } from '../types';
import { RoundedFloat } from './rounded-float';

interface TurnoverComponentProps {
    decimals: number;
    decisionData?: DecisionData;
    turnover: Turnover;
}

export const TurnoverComponent: React.FC<TurnoverComponentProps> = (props) => {
    return (
        <React.Fragment>
            {props.decisionData !== undefined && (
                <React.Fragment>
                    H. loss:{' '}
                    {props.turnover.isHittingBelowMaximumRisk ? (
                        <RoundedFloat
                            decimals={props.decimals}
                            value={props.decisionData.longRunHittingLoss}
                        />
                    ) : (
                        '-'
                    )}
                    <br />
                    S. loss:{' '}
                    <RoundedFloat
                        decimals={props.decimals}
                        value={props.decisionData.longRunStandingLoss}
                    />
                    <br />
                    <br />
                </React.Fragment>
            )}
            Losses: <RoundedFloat decimals={props.decimals} value={props.turnover.losses} />
            <br />
            Ties: <RoundedFloat decimals={props.decimals} value={props.turnover.ties} />
            <br />
            Wins: <RoundedFloat decimals={props.decimals} value={props.turnover.wins} />
            <br />
            P. Advantage:{' '}
            <RoundedFloat
                decimals={props.decimals}
                value={props.turnover.wins - props.turnover.losses}
            />
            <br />
            <br />
            P. Busting:{' '}
            <RoundedFloat decimals={props.decimals} value={props.turnover.playerBusting} />
            <br />
            D. Busting:{' '}
            <RoundedFloat decimals={props.decimals} value={props.turnover.dealerBusting} />
        </React.Fragment>
    );
};
