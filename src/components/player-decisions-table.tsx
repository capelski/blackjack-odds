import React, { useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { colors, desktopBreakpoint } from '../constants';
import { DealerFacts, GroupedPlayerFacts, PlayerActionOverridesByDealerCard } from '../types';
import { CustomTableDirection, CustomTable } from './custom-table';
import { PlayerDecisionsEdit } from './player-decisions-edit';
import { PlayerDecisionsTableCell, PlayerFactsColumn } from './player-decisions-table-cell';
import { RoundedFloat } from './rounded-float';

interface PlayerDecisionsTableProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    additionalColumns?: PlayerFactsColumn[];
    data: GroupedPlayerFacts;
    direction?: CustomTableDirection;
    processing: boolean;
    handKey?: string;
    dealerFacts: DealerFacts;
}

export const PlayerDecisionsTable: React.FC<PlayerDecisionsTableProps> = (props) => {
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const columns = useMemo(() => {
        const abbreviate = !isDesktop && props.direction !== 'vertical';
        const sortedDealerFacts = Object.values(props.dealerFacts.byCard).reverse();
        const columns: PlayerFactsColumn[] = [
            ...(props.additionalColumns || []),
            ...sortedDealerFacts.map<PlayerFactsColumn>((dealerFact) => ({
                Cell: PlayerDecisionsTableCell({
                    abbreviate,
                    actionOverrides: props.actionOverrides,
                    actionOverridesSetter: props.actionOverridesSetter,
                    dealerFact,
                    playerDecisionsEdit,
                    processing: props.processing
                }),
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
    }, [isDesktop, playerDecisionsEdit, props.actionOverrides, props.additionalColumns]);

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
                playerDecisionsEdit={playerDecisionsEdit}
                playerDecisionsEditSetter={setPlayerDecisionsEdit}
                processing={props.processing}
                handKey={props.handKey}
            />
            <br />
            <br />
        </React.Fragment>
    );
};
