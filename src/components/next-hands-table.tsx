import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Cell, Column } from 'react-table';
import { colors, desktopBreakpoint, labels } from '../constants';
import {
    DealerFact,
    DealerFacts,
    GroupedPlayerFacts,
    NextHand,
    PlayerActionData,
    PlayerActionOverridesByDealerCard,
    PlayerFact
} from '../types';
import { CustomTable, CustomTableDirection } from './custom-table';
import { PlayerDecisionsEdit } from './player-decisions-edit';
import { PlayerDecisionsTableCell } from './player-decisions-table-cell';
import { RoundedFloat } from './rounded-float';

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
    playerActionData?: PlayerActionData;
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

            const playerActionData = props.dealerFact
                ? playerFact?.vsDealerCard[props.dealerFact.hand.codes.processing].preferences[0]
                : playerFact?.vsDealerAverage.preferences[0];

            return {
                effectiveCode,
                nextHand,
                playerFact,
                playerActionData
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
            },
            {
                Header: labels.win,
                id: 'next-hand-win',
                Cell: (cellProps: NextHandCell) =>
                    cellProps.row.original.playerActionData ? (
                        <RoundedFloat
                            displayPercent={false}
                            value={
                                cellProps.row.original.playerActionData.vsDealerOutcome
                                    .winProbability
                            }
                        />
                    ) : (
                        '-'
                    )
            },
            {
                Header: labels.loss,
                id: 'next-hand-loss',
                Cell: (cellProps: NextHandCell) =>
                    cellProps.row.original.playerActionData ? (
                        <RoundedFloat
                            displayPercent={false}
                            value={
                                cellProps.row.original.playerActionData.vsDealerOutcome
                                    .lossProbability
                            }
                        />
                    ) : (
                        '-'
                    )
            },
            {
                Header: labels.push,
                id: 'next-hand-push',
                Cell: (cellProps: NextHandCell) =>
                    cellProps.row.original.playerActionData ? (
                        <RoundedFloat
                            displayPercent={false}
                            value={
                                cellProps.row.original.playerActionData.vsDealerOutcome
                                    .pushProbability
                            }
                        />
                    ) : (
                        '-'
                    )
            },
            {
                Header: labels.advantage,
                id: 'next-hand-advantage',
                Cell: (cellProps: NextHandCell) =>
                    cellProps.row.original.playerActionData ? (
                        <RoundedFloat
                            displayPercent={false}
                            value={
                                cellProps.row.original.playerActionData.vsDealerOutcome
                                    .playerAdvantage.hands
                            }
                        />
                    ) : (
                        '-'
                    )
            },
            {
                Header: labels.payout,
                id: 'next-hand-payout',
                Cell: (cellProps: NextHandCell) =>
                    cellProps.row.original.playerActionData ? (
                        <RoundedFloat
                            displayPercent={false}
                            value={
                                cellProps.row.original.playerActionData.vsDealerOutcome
                                    .playerAdvantage.payout
                            }
                        />
                    ) : (
                        '-'
                    )
            }
        ];
        return { columns, data };
    }, [isDesktop, props.actionOverrides, props.data, props.playerDecisionsEdit]);

    return (
        <div style={{ maxWidth: '100%', overflow: 'auto' }}>
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
            {props.dealerFact && (
                <React.Fragment>
                    <PlayerDecisionsEdit
                        actionOverrides={props.actionOverrides}
                        actionOverridesSetter={props.actionOverridesSetter}
                        hideClearButton={true}
                        playerDecisionsEdit={props.playerDecisionsEdit}
                        playerDecisionsEditSetter={props.playerDecisionsEditSetter}
                        processing={props.processing}
                    />
                    <br />
                </React.Fragment>
            )}
            <br />
        </div>
    );
};
