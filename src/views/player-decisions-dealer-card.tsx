import React from 'react';
import { useParams } from 'react-router-dom';
import {
    DecisionsProbabilityBreakdown,
    FinalScoresGraph,
    NextHandsTable,
    OutcomeComponent
} from '../components';
import { getPlayerDecisionDealerCardParams } from '../logic';
import { Action } from '../models';
import { DealerFacts, GroupedPlayerFacts, PlayerActionOverridesByDealerCard } from '../types';

interface PlayerDecisionsDealerCardProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    dealerFacts?: DealerFacts;
    playerFacts?: GroupedPlayerFacts;
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    processing: boolean;
}

export const PlayerDecisionsDealerCard: React.FC<PlayerDecisionsDealerCardProps> = (props) => {
    const { dealerGroupCode, playerGroupCode } = getPlayerDecisionDealerCardParams(useParams());

    const playerFactsGroup = props.playerFacts?.find((group) => group.code === playerGroupCode);

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
                    playerFactsGroup?.allFacts[0].vsDealerCard[dealerFact.hand.codes.processing]
                        .preferences[0].vsDealerOutcome
                }
            />
            {playerFactsGroup && dealerFact && (
                <React.Fragment>
                    <DecisionsProbabilityBreakdown
                        dealerCardKey={dealerFact.hand.codes.processing}
                        playerFact={playerFactsGroup.allFacts[0]}
                    />
                    <br />
                    <br />
                </React.Fragment>
            )}
            {playerFactsGroup !== undefined &&
                dealerFact !== undefined &&
                playerFactsGroup.allFacts[0].vsDealerCard[
                    dealerFact.hand.codes.processing
                ].preferences
                    .filter((x) => x.action !== Action.stand)
                    .map((playerActionData) => (
                        <React.Fragment key={playerActionData.action}>
                            <h4>{playerActionData.action} final score probabilities</h4>

                            {playerActionData.action === Action.hit &&
                                props.dealerFacts &&
                                props.playerFacts && (
                                    <NextHandsTable
                                        {...props}
                                        data={playerFactsGroup.allFacts[0].hand.nextHands}
                                        dealerFact={dealerFact}
                                        dealerFacts={props.dealerFacts}
                                        direction="vertical"
                                        playerFacts={props.playerFacts}
                                    />
                                )}

                            {playerActionData.action === Action.split &&
                                props.dealerFacts &&
                                props.playerFacts && (
                                    <NextHandsTable
                                        {...props}
                                        data={playerFactsGroup.allFacts[0].hand.splitNextHands}
                                        dealerFact={dealerFact}
                                        dealerFacts={props.dealerFacts}
                                        direction="vertical"
                                        playerFacts={props.playerFacts}
                                    />
                                )}

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
