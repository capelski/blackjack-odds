import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import { ActionDetails, OutcomeComponent, PlayerDecisionsTable } from '../components';
import { ScoreBadges } from '../components/score-badges';
import { desktopBreakpoint } from '../constants';
import { getPlayerDecisionScoreParams } from '../logic';
import {
    DealerFacts,
    Dictionary,
    GroupedPlayerFacts,
    PlayerActionOverridesByDealerCard
} from '../types';

interface PlayerDecisionsScoreProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    playerFacts?: GroupedPlayerFacts;
    dealerFacts?: DealerFacts;
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    processing: boolean;
}

export const PlayerDecisionsScore: React.FC<PlayerDecisionsScoreProps> = (props) => {
    const { playerGroupCode } = getPlayerDecisionScoreParams(useParams());

    const playerFactsGroup = props.playerFacts?.find(
        (playerFactGroup) => playerFactGroup.code === playerGroupCode
    );

    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });
    const [expandedActions, setExpandedActions] = useState<Dictionary<boolean>>({});

    return (
        <div>
            <ScoreBadges playerFactsGroup={playerFactsGroup} />

            {playerFactsGroup !== undefined &&
                [...playerFactsGroup.allFacts[0].vsDealerAverage.preferences]
                    .sort((a, b) => a.action.localeCompare(b.action))
                    .map((playerActionData) => (
                        <ActionDetails
                            {...props}
                            actionData={playerActionData}
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

            <h4>Dealer card based decisions</h4>
            <OutcomeComponent
                outcome={playerFactsGroup?.allFacts[0].vsDealerCard_average.vsDealerOutcome}
            />
            {playerGroupCode &&
            playerFactsGroup !== undefined &&
            props.dealerFacts !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    data={[playerFactsGroup]}
                    dealerFacts={props.dealerFacts}
                    direction={isDesktop ? 'horizontal' : 'vertical'}
                    selectedPlayerFactsGroup={playerFactsGroup}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
