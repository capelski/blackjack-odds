import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Cell, Column } from 'react-table';
import { colors, desktopBreakpoint } from '../constants';
import {
    DealerFact,
    DealerFacts,
    GroupedPlayerFacts,
    NextHand,
    PlayerActionOverridesByDealerCard,
    PlayerFact
} from '../types';
import { CustomTableDirection, CustomTable } from './custom-table';
import { PlayerDecisionsEdit } from './player-decisions-edit';
import { PlayerDecisionsTableCell } from './player-decisions-table-cell';

interface NextHandsTableProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    data: NextHand[];
    dealerFact?: DealerFact;
    dealerFacts: DealerFacts;
    direction?: CustomTableDirection;
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    playerFacts: GroupedPlayerFacts;
    processing: boolean;
}

type RowData = {
    effectiveCode: string;
    nextHand: NextHand;
    playerFact?: PlayerFact;
};

type NextHandColumn = Column<RowData>;
type NextHandCell = Cell<RowData>;

const isPlayerFactMatch = (nextHand: NextHand) => (playerFact: PlayerFact) =>
    playerFact.hand.codes.processing === nextHand.codes.processing;

const nextActionColumnId = 'next-action';

export const NextHandsTable: React.FC<NextHandsTableProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const { columns, data } = useMemo(() => {
        const data = props.data.map((nextHand): RowData => {
            const playerFact = props.playerFacts
                ?.find((factsGroup) => factsGroup.allFacts.some(isPlayerFactMatch(nextHand)))
                ?.allFacts.find(isPlayerFactMatch(nextHand));

            const effectiveCode =
                playerFact && nextHand.isForbiddenSplit
                    ? String(playerFact.hand.effectiveScore)
                    : nextHand.codes.group;

            return {
                effectiveCode,
                nextHand,
                playerFact
            };
        });

        const columns: NextHandColumn[] = [
            {
                Header: 'Next card',
                id: 'next-card',
                Cell: (cellProps: NextHandCell) => {
                    const { nextHand } = cellProps.row.original;
                    return nextHand.cards[nextHand.cards.length - 1].symbol;
                }
            },
            {
                Header: 'Next hand',
                id: 'next-hand',
                Cell: (cellProps: NextHandCell) => cellProps.row.original.effectiveCode
            },
            {
                Header: 'Next action',
                id: nextActionColumnId,
                Cell: (cellProps: NextHandCell) => {
                    const { playerFact } = cellProps.row.original;
                    return playerFact ? (
                        <PlayerDecisionsTableCell
                            abbreviate={false}
                            actionOverrides={props.actionOverrides}
                            actionOverridesSetter={props.actionOverridesSetter}
                            dealerFact={props.dealerFact}
                            effectiveCode={cellProps.row.original.effectiveCode}
                            playerDecisionsEdit={props.playerDecisionsEdit}
                            playerFacts={[playerFact]}
                            processing={props.processing}
                        />
                    ) : (
                        '-'
                    );
                }
            }
        ];
        return { columns, data };
    }, [isDesktop, props.actionOverrides, props.data, props.playerDecisionsEdit]);

    return (
        <React.Fragment>
            <CustomTable
                cellStyle={(cellProps) => {
                    const allFacts = cellProps.row.original.playerFact;
                    const dealerCardKey = props.dealerFact?.hand.codes.processing;

                    const hasOverride =
                        dealerCardKey &&
                        allFacts &&
                        allFacts.vsDealerCard[dealerCardKey].hasOverride &&
                        cellProps.column.id === nextActionColumnId;

                    return {
                        borderColor: hasOverride ? colors.border.highlight : colors.border.regular,
                        opacity: hasOverride ? 0.7 : undefined
                    };
                }}
                columns={columns}
                data={data}
                direction="horizontal"
                width="100%"
            />
            <br />
            <PlayerDecisionsEdit
                actionOverrides={props.actionOverrides}
                actionOverridesSetter={props.actionOverridesSetter}
                hideClearButton={true}
                playerDecisionsEdit={props.playerDecisionsEdit}
                playerDecisionsEditSetter={props.playerDecisionsEditSetter}
                processing={props.processing}
            />
            <br />
            <br />
        </React.Fragment>
    );
};
