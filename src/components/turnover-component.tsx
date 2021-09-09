import React from 'react';
import { Turnover } from '../types';
import { RoundedFloat } from './rounded-float';

interface TurnoverComponentProps {
    decimals: number;
    displayActionsLoss: boolean;
    turnover: Turnover;
}

export const TurnoverComponent: React.FC<TurnoverComponentProps> = (props) => {
    return (
        <React.Fragment>
            {props.displayActionsLoss && (
                <React.Fragment>
                    H. loss:{' '}
                    {props.turnover.canHit ? (
                        <RoundedFloat
                            decimals={props.decimals}
                            value={props.turnover.hittingLoss}
                        />
                    ) : (
                        '-'
                    )}
                    <br />
                    S. loss:{' '}
                    <RoundedFloat decimals={props.decimals} value={props.turnover.standingLoss} />
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
            {props.displayActionsLoss && (
                <React.Fragment>
                    <br />
                    <br />
                    P. Busting:{' '}
                    <RoundedFloat decimals={props.decimals} value={props.turnover.playerBusting} />
                    <br />
                    D. Busting:{' '}
                    <RoundedFloat decimals={props.decimals} value={props.turnover.dealerBusting} />
                </React.Fragment>
            )}{' '}
        </React.Fragment>
    );
};
