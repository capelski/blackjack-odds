import React from 'react';
import { Turnover } from '../types';
import { RoundedFloat } from './rounded-float';

interface TurnoverComponentProps {
    decimals: number;
    turnover: Turnover;
}

export const TurnoverComponent: React.FC<TurnoverComponentProps> = (props) => {
    return (
        <React.Fragment>
            H. loss:{' '}
            {props.turnover.canHit ? (
                <RoundedFloat decimals={props.decimals} value={props.turnover.hittingLoss} />
            ) : (
                '-'
            )}
            <br />
            S. loss: <RoundedFloat decimals={props.decimals} value={props.turnover.standingLoss} />
            <br />
            <br />
            Losses: <RoundedFloat decimals={props.decimals} value={props.turnover.losses} />
            <br />
            Ties: <RoundedFloat decimals={props.decimals} value={props.turnover.ties} />
            <br />
            Wins: <RoundedFloat decimals={props.decimals} value={props.turnover.wins} />
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
