import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import { InitialHandProbability, OutcomeComponent, PlayerDecisionsTable } from '../components';
import { desktopBreakpoint } from '../constants';
import { getPlayerDecisionScoreParams } from '../logic';
import { DealerFacts, PlayerActionOverridesByDealerCard, PlayerFact } from '../types';

interface PlayerDecisionsScoreProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    playerFacts?: PlayerFact[];
    dealerFacts?: DealerFacts;
    processing: boolean;
}

export const PlayerDecisionsScore: React.FC<PlayerDecisionsScoreProps> = (props) => {
    const { playerDisplayKey } = getPlayerDecisionScoreParams(useParams());

    const playerFact = props.playerFacts?.find(
        (playerFact) => playerFact.hand.displayKey === playerDisplayKey
    );

    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });
    const [displayCombinations, setDisplayCombinations] = useState(false);

    return (
        <div>
            <h3>{playerDisplayKey} player decisions</h3>
            <OutcomeComponent outcome={playerFact?.vsDealerCard_average.vsDealerOutcome} />
            <h4>Dealer card based decisions</h4>
            {playerDisplayKey && playerFact !== undefined && props.dealerFacts !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    data={[playerFact]}
                    direction={isDesktop ? 'horizontal' : 'vertical'}
                    // playerChoices={props.playerChoices}
                    handKey={playerFact.hand.key}
                    dealerFacts={props.dealerFacts}
                />
            ) : (
                'Processing...'
            )}
            <p>
                Initial hand probability:{' '}
                <span style={{ fontWeight: 'bold' }}>
                    <InitialHandProbability playerFact={playerFact} />
                </span>
            </p>
            <p>
                <span
                    onClick={() => {
                        setDisplayCombinations(!displayCombinations);
                    }}
                    style={{
                        cursor: 'pointer'
                    }}
                >
                    {displayCombinations ? '👇' : '👉'}
                </span>{' '}
                Card combinations ({playerFact?.hand.cardCombinations.length || '-'})
            </p>
            {playerFact && displayCombinations && (
                <ul>
                    {playerFact.hand.cardCombinations.map((combination) => (
                        <li key={combination}>{combination}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
