import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
    getDisplayActions,
    getPlayerDecisionDealerCardPath,
    setPlayerFactOverride
} from '../logic';
import { Action } from '../models';
import { DealerFact, PlayerActionOverridesByDealerCard, PlayerFactsGroup } from '../types';
import { CustomCell, CustomColumn } from './custom-table';

export type PlayerFactsColumn = CustomColumn<
    PlayerFactsGroup,
    {
        dealerCardKey?: string;
    }
>;

export type PlayerFactsCell = CustomCell<PlayerFactsGroup, PlayerFactsColumn>;

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
    return (cellProps: PlayerFactsCell) => {
        const dealerCardKey = cellProps.column.dealerCardKey!;

        const { allFacts } = cellProps.row.original;
        const mainAction = allFacts[0].vsDealerCard[dealerCardKey].preferences[0].action;
        const actionableFacts =
            mainAction === Action.hit || mainAction === Action.stand
                ? [allFacts[0]]
                : allFacts.filter((playerFact, index) => {
                      return (
                          index === 0 ||
                          playerFact.vsDealerCard[dealerCardKey].preferences[0].action !==
                              mainAction
                      );
                  });

        const { displayActions, styles } = getDisplayActions(
            actionableFacts.map(
                (playerFact) => playerFact.vsDealerCard[dealerCardKey].preferences[0].action
            ),
            props.abbreviate
        );

        return (
            <div style={{ ...baseStyles, ...styles }} key={dealerCardKey}>
                <div>
                    {!props.processing && props.playerDecisionsEdit ? (
                        actionableFacts.map((playerFact) => {
                            const { preferences } = playerFact.vsDealerCard[dealerCardKey];
                            return (
                                <select
                                    disabled={preferences.length === 1}
                                    key={playerFact.hand.codes.processing}
                                    onChange={(event) => {
                                        const selectedAction = event.target.value as Action;
                                        const nextActionOverrides = setPlayerFactOverride(
                                            props.actionOverrides,
                                            cellProps.row.original,
                                            playerFact,
                                            dealerCardKey,
                                            selectedAction
                                        );

                                        props.actionOverridesSetter(nextActionOverrides);
                                    }}
                                    value={preferences[0].action}
                                >
                                    {preferences.map((preference) => {
                                        return (
                                            <option
                                                key={preference.action}
                                                value={preference.action}
                                            >
                                                {preference.action}
                                            </option>
                                        );
                                    })}
                                </select>
                            );
                        })
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
