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
    const { playerGroupCode } = getPlayerDecisionScoreParams(useParams());

    const playerFact = props.playerFacts?.find(
        (playerFact) => playerFact.hand.codes.group === playerGroupCode
    );

    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });
    const [displayCodes, setDisplayCodes] = useState(false);

    return (
        <div>
            <h3>{playerGroupCode} player decisions</h3>
            <OutcomeComponent outcome={playerFact?.vsDealerCard_average.vsDealerOutcome} />
            <h4>Dealer card based decisions</h4>
            {playerGroupCode && playerFact !== undefined && props.dealerFacts !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    data={[playerFact]}
                    direction={isDesktop ? 'horizontal' : 'vertical'}
                    // playerChoices={props.playerChoices}
                    handKey={playerFact.hand.codes.processing}
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
                        setDisplayCodes(!displayCodes);
                    }}
                    style={{
                        cursor: 'pointer'
                    }}
                >
                    {displayCodes ? '👇' : '👉'}
                </span>{' '}
                Card combinations ({playerFact?.hand.codes.displayEquivalences.length || '-'})
            </p>
            {playerFact && displayCodes && (
                <ul>
                    {playerFact.hand.codes.displayEquivalences.map((code) => (
                        <li key={code}>{code}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
