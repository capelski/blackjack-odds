import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CellProps } from 'react-table';
import { getDisplayActions, getOverrideActions, getPlayerDecisionDealerCardPath } from '../logic';
import { Action } from '../models';
import { DealerFact, PlayerActionOverridesByDealerCard, PlayerFactsGroup } from '../types';

export type PlayerFactCellProps = CellProps<PlayerFactsGroup>;

interface PlayerDecisionsTableCellProps {
    abbreviate: boolean;
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    dealerFact: DealerFact;
    playerDecisionsEdit: boolean;
    processing: boolean;
}

const baseStyles: CSSProperties = {
    padding: '4px 0'
};

export const PlayerDecisionsTableCell = (props: PlayerDecisionsTableCellProps) => {
    return (cellProps: PlayerFactCellProps) => {
        const { hand, vsDealerCard } = cellProps.row.original.mainFact;

        const preferences = vsDealerCard[props.dealerFact.hand.codes.processing].preferences;
        const actions = preferences.map((p) => p.action);

        const { actionStyles, displayActions } = getDisplayActions(actions, {
            abbreviate: props.abbreviate
        });

        return (
            <div
                style={{ ...baseStyles, ...actionStyles }}
                key={props.dealerFact.hand.codes.processing}
            >
                <div>
                    {!props.processing && props.playerDecisionsEdit ? (
                        <select
                            onChange={(event) => {
                                const actions = event.target.value.split(' / ') as Action[];
                                props.actionOverridesSetter({
                                    ...props.actionOverrides,
                                    [props.dealerFact.hand.codes.processing]: {
                                        ...props.actionOverrides[
                                            props.dealerFact.hand.codes.processing
                                        ],
                                        [hand.codes.processing]: actions
                                    }
                                });
                            }}
                            value={displayActions}
                        >
                            {getOverrideActions(preferences.map((x) => x.action)).map((actions) => {
                                const displayActions = actions.join(' / ');
                                return (
                                    <option key={displayActions} value={displayActions}>
                                        {displayActions}
                                    </option>
                                );
                            })}
                        </select>
                    ) : (
                        <Link
                            to={getPlayerDecisionDealerCardPath(
                                cellProps.row.original.code,
                                props.dealerFact.hand.codes.group
                            )}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                            {displayActions}
                        </Link>
                    )}
                </div>
            </div>
        );
    };
};
