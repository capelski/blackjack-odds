import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionDetails } from '../components';
import { ScoreBadges } from '../components/score-badges';
import { getPlayerDecisionDealerCardParams } from '../logic';
import {
    DealerFacts,
    Dictionary,
    GroupedPlayerFacts,
    PlayerActionOverridesByDealerCard
} from '../types';

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

    const [expandedActions, setExpandedActions] = useState<Dictionary<boolean>>({});

    return (
        <div>
            <ScoreBadges
                dealerCard={dealerFact?.hand.codes.processing}
                playerFactsGroup={playerFactsGroup}
            />

            {playerFactsGroup !== undefined &&
                dealerFact !== undefined &&
                [
                    ...playerFactsGroup.allFacts[0].vsDealerCard[dealerFact.hand.codes.processing]
                        .preferences
                ]
                    .sort((a, b) => a.action.localeCompare(b.action))
                    .map((playerActionData) => (
                        <ActionDetails
                            {...props}
                            actionData={playerActionData}
                            dealerFact={dealerFact}
                            expand={() =>
                                setExpandedActions({
                                    ...expandedActions,
                                    [playerActionData.action]:
                                        !expandedActions[playerActionData.action]
                                })
                            }
                            hand={playerFactsGroup.allFacts[0].hand}
                            isExpanded={expandedActions[playerActionData.action]}
                            key={playerActionData.action}
                            playerFacts={props.playerFacts!}
                            playerGroupCode={playerGroupCode!}
                        />
                    ))}
        </div>
    );
};
