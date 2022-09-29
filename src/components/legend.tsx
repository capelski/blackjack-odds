import React from 'react';
import { probabilityLabels } from '../constants';

export const Legend: React.FC = () => {
    return (
        <React.Fragment>
            <h3>Legend</h3>
            <p>{probabilityLabels.playerBusting} = probability of player busting</p>
            <p>{probabilityLabels.dealerBusting} = probability of dealer busting</p>
            <p>
                {probabilityLabels.playerLessThanDealer} = probability of player getting a score
                lower than dealer's score
            </p>
            <p>
                {probabilityLabels.playerEqualToDealer} = probability of player getting the same
                score as dealer's score
            </p>
            <p>
                {probabilityLabels.playerMoreThanDealer} = probability of player getting a score
                higher than dealer's score
            </p>
            <p>
                {probabilityLabels.playerLessThanCurrent('X')} = probability of player getting a
                score lower than X (only soft hands)
            </p>
            <p>
                {probabilityLabels.playerLoss} = probability of player losing (i.e.{' '}
                {probabilityLabels.playerBusting} + {probabilityLabels.playerLessThanDealer} )
            </p>
            <p>
                {probabilityLabels.playerPush} = probability of player pushing (i.e.{' '}
                {probabilityLabels.playerEqualToDealer} )
            </p>
            <p>
                {probabilityLabels.playerWin} = probability of player winning (i.e.{' '}
                {probabilityLabels.dealerBusting} + {probabilityLabels.playerMoreThanDealer} )
            </p>
            <p>
                {probabilityLabels.playerAdvantageHands} = probability of winning hands on the long
                run (i.e. {probabilityLabels.playerWin} - {probabilityLabels.playerLoss} )
            </p>
            <p>
                {probabilityLabels.playerAdvantagePayout} = probability of winning money on the long
                run (i.e. {probabilityLabels.playerWin} * winPayout - {probabilityLabels.playerLoss}{' '}
                * lossCost )
            </p>
        </React.Fragment>
    );
};
