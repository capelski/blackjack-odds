import React, { useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { colors, desktopBreakpoint } from '../constants';
import { DealerFacts, PlayerActionOverridesByDealerCard, PlayerFact } from '../types';
import { CustomColumn, CustomTableDirection, CustomTable } from './custom-table';
import { PlayerDecisionsEdit } from './player-decisions-edit';
import { PlayerDecisionsTableCell } from './player-decisions-table-cell';
import { RoundedFloat } from './rounded-float';

export type PlayerFactColumn = CustomColumn<
    PlayerFact,
    {
        dealerCardKey?: string;
    }
>;

interface PlayerDecisionsTableProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    additionalColumns?: PlayerFactColumn[];
    data: PlayerFact[];
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
        const columns: PlayerFactColumn[] = [
            ...(props.additionalColumns || []),
            ...sortedDealerFacts.map<PlayerFactColumn>((dealerFact) => ({
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
                            {dealerFact.hand.displayKey}
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
                    const playerFact = cellProps.row.original;
                    const { dealerCardKey } = cellProps.column;

                    const hasOverride =
                        dealerCardKey && playerFact.vsDealerCard[dealerCardKey].hasOverride;

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
