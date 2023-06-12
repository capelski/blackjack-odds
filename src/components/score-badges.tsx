import React, { useState } from 'react';
import Modal from 'react-modal';
import { colors } from '../constants';
import { PlayerFactsGroup } from '../types';
import { Badge } from './badge';
import { InitialHandProbability } from './initial-hand-probability';
import { OutcomeComponent } from './outcome';

interface ScoreBadgesProps {
    playerFactsGroup?: PlayerFactsGroup;
    dealerCard?: string;
}

export const ScoreBadges: React.FC<ScoreBadgesProps> = (props) => {
    const [displayCodes, setDisplayCodes] = useState(false);
    const toggleDisplayCodes = () => setDisplayCodes(!displayCodes);

    const playerActionData = props.dealerCard
        ? props.playerFactsGroup?.allFacts[0].vsDealerCard[props.dealerCard].preferences[0]
        : props.playerFactsGroup?.allFacts[0].vsDealerAverage.preferences[0];

    return (
        <div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)'
                }}
            >
                <Badge {...colors.advantage}>
                    <div>Decision</div>
                    <div style={{ fontSize: 24 }}>{playerActionData?.action || '-'}</div>
                </Badge>

                <Badge {...colors.advantage}>
                    <div>Initial hand %</div>
                    <div style={{ fontSize: 24 }}>
                        <InitialHandProbability
                            displayPercent={false}
                            playerFact={props.playerFactsGroup?.allFacts[0]}
                        />
                    </div>
                </Badge>

                <Badge {...colors.advantage}>
                    <div>Combinations</div>
                    <div style={{ fontSize: 24 }}>
                        {props.playerFactsGroup?.combinations.length || '-'}{' '}
                        {props.playerFactsGroup && (
                            <React.Fragment>
                                <span
                                    onClick={toggleDisplayCodes}
                                    style={{
                                        cursor: 'pointer'
                                    }}
                                >
                                    👁️
                                </span>
                                <Modal
                                    isOpen={displayCodes}
                                    onRequestClose={toggleDisplayCodes}
                                    style={{ content: { inset: 0 } }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            fontSize: 20,
                                            justifyContent: 'end'
                                        }}
                                    >
                                        <span
                                            onClick={toggleDisplayCodes}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            ✖️
                                        </span>
                                    </div>

                                    {props.playerFactsGroup?.combinations.map((combination) => (
                                        <div
                                            key={combination}
                                            style={{
                                                fontSize: 20,
                                                marginBottom: 8,
                                                textAlign: 'center'
                                            }}
                                        >
                                            {combination}
                                        </div>
                                    ))}
                                </Modal>
                            </React.Fragment>
                        )}
                    </div>
                </Badge>
            </div>

            <br />

            <OutcomeComponent outcome={playerActionData?.vsDealerOutcome} />
        </div>
    );
};
