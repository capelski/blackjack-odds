import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import {
    InitialHandProbability,
    OutcomeComponent,
    PlayerDecisionsTable,
    PlayerFactsCell,
    PlayerFactsColumn
} from '../components';
import { desktopBreakpoint, colors } from '../constants';
import { getPlayerDecisionScorePath } from '../logic';
import {
    DealerFacts,
    GroupedPlayerFacts,
    PlayerActionOverridesByDealerCard,
    PlayerBaseData
} from '../types';

interface PlayerDecisionsAllProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    dealerFacts?: DealerFacts;
    playerBaseData?: PlayerBaseData;
    playerFacts?: GroupedPlayerFacts;
    processing: boolean;
}

export const PlayerDecisionsAll: React.FC<PlayerDecisionsAllProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const additionalColumns = useMemo((): PlayerFactsColumn[] => {
        return [
            {
                Cell: (cellProps: PlayerFactsCell) => {
                    return (
                        <div>
                            <Link
                                to={getPlayerDecisionScorePath(cellProps.row.original.code)}
                                style={{ color: colors.link.default, textDecoration: 'none' }}
                            >
                                {cellProps.row.original.code}
                            </Link>
                        </div>
                    );
                },
                id: 'score'
            },
            {
                Cell: (cellProps: PlayerFactsCell) => {
                    return (
                        <div>
                            <InitialHandProbability
                                displayPercent={false}
                                playerFact={cellProps.row.original.allFacts[0]}
                            />
                        </div>
                    );
                },
                Header: '%',
                id: 'initialHandProbability'
            }
        ];
    }, [isDesktop, props.playerFacts]);

    return (
        <div>
            <h3>Player decisions</h3>
            <OutcomeComponent outcome={props.playerBaseData?.vsDealerOutcome} />
            {props.dealerFacts !== undefined && props.playerFacts !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    additionalColumns={additionalColumns}
                    data={props.playerFacts}
                    dealerFacts={props.dealerFacts}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
