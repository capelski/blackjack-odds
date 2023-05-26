import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import { InitialHandProbability, OutcomeComponent, PlayerDecisionsTable } from '../components';
import { desktopBreakpoint } from '../constants';
import { getPlayerDecisionScoreParams } from '../logic';
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
        </div>
    );
};
