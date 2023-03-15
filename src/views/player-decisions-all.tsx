import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { CellProps } from 'react-table';
import {
    InitialHandProbability,
    OutcomeComponent,
    PlayerDecisionsTable,
    PlayerFactColumn
} from '../components';
import { desktopBreakpoint, colors } from '../constants';
import { getPlayerDecisionScorePath } from '../logic';
import {
    DealerFacts,
    PlayerActionOverridesByDealerCard,
    PlayerBaseData,
    PlayerFact
} from '../types';

interface PlayerDecisionsAllProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    dealerFacts?: DealerFacts;
    playerBaseData?: PlayerBaseData;
    playerFacts?: PlayerFact[];
    processing: boolean;
}

export const PlayerDecisionsAll: React.FC<PlayerDecisionsAllProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const additionalColumns = useMemo((): PlayerFactColumn[] => {
        return [
            {
                accessor: 'hand',
                Cell: (cellProps: CellProps<PlayerFact, PlayerFact['hand']>) => {
                    return (
                        <div>
                            <Link
                                to={getPlayerDecisionScorePath(cellProps.value.codes.group)}
                                style={{ color: colors.link.default, textDecoration: 'none' }}
                            >
                                {cellProps.value.codes.group}
                            </Link>
                        </div>
                    );
                },
                id: 'score'
            },
            {
                Cell: (cellProps: CellProps<PlayerFact>) => {
                    return (
                        <div>
                            <InitialHandProbability
                                displayPercent={false}
                                playerFact={cellProps.row.original}
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
