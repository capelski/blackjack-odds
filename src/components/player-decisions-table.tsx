import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { colors, desktopBreakpoint } from '../constants';
import {
    DealerFacts,
    GroupedPlayerFacts,
    PlayerActionOverridesByDealerCard,
    PlayerFactsGroup
} from '../types';
import { CustomTableDirection, CustomTable } from './custom-table';
import { PlayerDecisionsEdit } from './player-decisions-edit';
import {
    PlayerDecisionsTableCell,
    PlayerFactsCell,
    PlayerFactsColumn
} from './player-decisions-table-cell';
import { RoundedFloat } from './rounded-float';

interface PlayerDecisionsTableProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    additionalColumns?: PlayerFactsColumn[];
    data: GroupedPlayerFacts;
    dealerFacts: DealerFacts;
    direction?: CustomTableDirection;
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    processing: boolean;
    selectedPlayerFactsGroup?: PlayerFactsGroup;
}

export const PlayerDecisionsTable: React.FC<PlayerDecisionsTableProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const columns = useMemo(() => {
        const abbreviate = !isDesktop && props.direction !== 'vertical';
        const sortedDealerFacts = Object.values(props.dealerFacts.byCard).reverse();
        const columns: PlayerFactsColumn[] = [
            ...(props.additionalColumns || []),
            ...sortedDealerFacts.map<PlayerFactsColumn>((dealerFact) => ({
                Cell: (cellProps: PlayerFactsCell) => {
                    return (
                        <PlayerDecisionsTableCell
                            abbreviate={abbreviate}
                            actionOverrides={props.actionOverrides}
                            actionOverridesSetter={props.actionOverridesSetter}
                            dealerFact={dealerFact}
                            playerDecisionsEdit={props.playerDecisionsEdit}
                            playerFacts={cellProps.row.original.allFacts}
                            processing={props.processing}
                        />
                    );
                },
                Header: () => {
                    return (
                        <React.Fragment>
                            {dealerFact.hand.codes.display}
                            {!abbreviate && (
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontStyle: 'italic',
                                        fontWeight: 'normal'
                                    }}
                                >
                                    {' '}
                                    (
                                    <RoundedFloat value={dealerFact.weight} />)
                                </span>
                            )}
                        </React.Fragment>
                    );
                },
                id: dealerFact.hand.codes.processing,
                dealerCardKey: dealerFact.hand.codes.processing
            }))
        ];
        return columns;
    }, [isDesktop, props.playerDecisionsEdit, props.actionOverrides, props.additionalColumns]);

    return (
        <React.Fragment>
            <CustomTable
                cellStyle={(cellProps) => {
                    const { allFacts } = cellProps.row.original;
                    const { dealerCardKey } = cellProps.column;

                    const hasOverride =
                        dealerCardKey &&
                        allFacts.some((x) => x.vsDealerCard[dealerCardKey].hasOverride);

                    return {
                        borderColor: hasOverride ? colors.border.highlight : colors.border.regular,
                        opacity: hasOverride ? 0.7 : undefined
                    };
                }}
                columns={columns}
                data={props.data}
                direction={props.direction}
                width="100%"
            />
            <br />
            <PlayerDecisionsEdit
                actionOverrides={props.actionOverrides}
                actionOverridesSetter={props.actionOverridesSetter}
                playerDecisionsEdit={props.playerDecisionsEdit}
                playerDecisionsEditSetter={props.playerDecisionsEditSetter}
                processing={props.processing}
                selectedPlayerFactsGroup={props.selectedPlayerFactsGroup}
            />
            <br />
            <br />
        </React.Fragment>
    );
};
