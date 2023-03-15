import React from 'react';
import { useParams } from 'react-router-dom';
import { DecisionsProbabilityBreakdown, FinalScoresGraph, OutcomeComponent } from '../components';
import { getPlayerDecisionDealerCardParams } from '../logic';
import { Action } from '../models';
import { DealerFacts, PlayerFact } from '../types';

interface PlayerDecisionsDealerCardProps {
    dealerFacts?: DealerFacts;
    playerFacts?: PlayerFact[];
    processing: boolean;
}

export const PlayerDecisionsDealerCard: React.FC<PlayerDecisionsDealerCardProps> = (props) => {
    const { dealerGroupCode, playerGroupCode } = getPlayerDecisionDealerCardParams(useParams());
    const playerFact = props.playerFacts?.find(
        (playerFact) => playerFact.hand.codes.group === playerGroupCode
    );

    const dealerFact =
        props.dealerFacts &&
        Object.values(props.dealerFacts.byCard).find(
            (dealerFact) => dealerFact.hand.codes.group === dealerGroupCode
        );

    return (
        <div>
            <h3>
                {playerGroupCode} vs {dealerGroupCode} player decisions
            </h3>
            <OutcomeComponent
                outcome={
                    dealerFact &&
                    playerFact?.vsDealerCard[dealerFact.hand.codes.processing].preferences[0]
                        .vsDealerOutcome
                }
            />
            {playerFact && dealerFact && (
                <React.Fragment>
                    <DecisionsProbabilityBreakdown
                        dealerCardKey={dealerFact.hand.codes.processing}
                        playerFact={playerFact}
                    />
                    <br />
                    <br />
                </React.Fragment>
            )}
            {playerFact !== undefined &&
                dealerFact !== undefined &&
                playerFact.vsDealerCard[dealerFact.hand.codes.processing].preferences
                    .filter((x) => x.action !== Action.stand)
                    .map((playerActionData) => (
                        <React.Fragment key={playerActionData.action}>
                            <h4>{playerActionData.action} final score probabilities</h4>
                            <FinalScoresGraph
                                finalScores={playerActionData.finalScores}
                                handDisplayKey={playerGroupCode!}
                                playerFacts={props.playerFacts!}
                            />
                            <br />
                            <br />
                        </React.Fragment>
                    ))}
        </div>
    );
};
