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
    const { dealerDisplayKey, playerDisplayKey } = getPlayerDecisionDealerCardParams(useParams());
    const playerFact = props.playerFacts?.find(
        (playerFact) => playerFact.hand.displayKey === playerDisplayKey
    );

    const dealerFact =
        props.dealerFacts &&
        Object.values(props.dealerFacts.byCard).find(
            (dealerFact) => dealerFact.hand.displayKey === dealerDisplayKey
        );

    return (
        <div>
            <h3>
                {playerDisplayKey} vs {dealerDisplayKey} player decisions
            </h3>
            <OutcomeComponent outcome={playerFact?.vsDealerCard_average.vsDealerOutcome} />
            {playerFact && dealerFact && (
                <React.Fragment>
                    <DecisionsProbabilityBreakdown
                        dealerCardKey={dealerFact.hand.key}
                        playerFact={playerFact}
                    />
                    <br />
                    <br />
                </React.Fragment>
            )}
            {playerFact !== undefined &&
                dealerFact !== undefined &&
                playerFact.vsDealerCard[dealerFact.hand.key].preferences
                    .filter((x) => x.action !== Action.stand)
                    .map((playerActionData) => (
                        <React.Fragment key={playerActionData.action}>
                            <h4>{playerActionData.action} final score probabilities</h4>
                            <FinalScoresGraph
                                finalScores={playerActionData.finalScores}
                                handDisplayKey={playerDisplayKey!}
                                playerFacts={props.playerFacts!}
                            />
                            <br />
                            <br />
                        </React.Fragment>
                    ))}
        </div>
    );
};
