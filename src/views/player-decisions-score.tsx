import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import {
    DecisionsProbabilityBreakdown,
    FinalScoresGraph,
    InitialHandProbability,
    NextHandsTable,
    OutcomeComponent,
    PlayerDecisionsTable
} from '../components';
import { desktopBreakpoint } from '../constants';
import { getPlayerDecisionScoreParams } from '../logic';
import { Action } from '../models';
import { DealerFacts, GroupedPlayerFacts, PlayerActionOverridesByDealerCard } from '../types';

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
    const [displayCodes, setDisplayCodes] = useState(false);

    return (
        <div>
            <OutcomeComponent
                outcome={playerFactsGroup?.allFacts[0].vsDealerCard_average.vsDealerOutcome}
            />
            <p>
                Initial hand probability:{' '}
                <span style={{ fontWeight: 'bold' }}>
                    <InitialHandProbability playerFact={playerFactsGroup?.allFacts[0]} />
                </span>
            </p>
            <p>
                <span
                    onClick={() => {
                        setDisplayCodes(!displayCodes);
                    }}
                    style={{
                        cursor: 'pointer'
                    }}
                >
                    {displayCodes ? '👇' : '👉'}
                </span>{' '}
                Card combinations ({playerFactsGroup?.combinations.length || '-'})
            </p>
            {playerFactsGroup && displayCodes && (
                <ul>
                    {playerFactsGroup?.combinations.map((combination) => (
                        <li key={combination}>{combination}</li>
                    ))}
                </ul>
            )}
            {playerFactsGroup && (
                <React.Fragment>
                    <DecisionsProbabilityBreakdown playerFact={playerFactsGroup.allFacts[0]} />
                    <br />
                    <br />
                </React.Fragment>
            )}
            {playerFactsGroup !== undefined &&
                playerFactsGroup.allFacts[0].vsDealerAverage.preferences
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

            <h4>Dealer card based decisions</h4>
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
