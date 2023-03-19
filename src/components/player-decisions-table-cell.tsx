import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { getDisplayActions, getPlayerDecisionDealerCardPath } from '../logic';
import { Action } from '../models';
import {
    DealerFact,
    Dictionary,
    PlayerActionOverridesByDealerCard,
    PlayerFact,
    PlayerFactsGroup
} from '../types';
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

        const relevantFacts = Object.values(
            cellProps.row.original.allFacts.reduce<Dictionary<PlayerFact>>(
                (reduced, playerFact) => {
                    const key = playerFact.vsDealerCard[dealerCardKey].preferences[0].action;
                    return {
                        ...reduced,
                        [key]: reduced[key] || playerFact
                    };
                },
                {}
            )
        );

        const { displayActions, styles } = getDisplayActions(
            relevantFacts.map(
                (playerFact) => playerFact.vsDealerCard[dealerCardKey].preferences[0].action
            ),
            props.abbreviate
        );

        return (
            <div style={{ ...baseStyles, ...styles }} key={dealerCardKey}>
                <div>
                    {!props.processing && props.playerDecisionsEdit ? (
                        relevantFacts.map((playerFact) => {
                            return (
                                <select
                                    key={playerFact.hand.codes.processing}
                                    onChange={(event) => {
                                        props.actionOverridesSetter({
                                            ...props.actionOverrides,
                                            [dealerCardKey]: {
                                                ...props.actionOverrides[dealerCardKey],
                                                [playerFact.hand.codes.processing]: event.target
                                                    .value as Action
                                            }
                                        });
                                    }}
                                    value={
                                        playerFact.vsDealerCard[dealerCardKey].preferences[0].action
                                    }
                                >
                                    {playerFact.vsDealerCard[dealerCardKey].preferences.map(
                                        (preference) => {
                                            return (
                                                <option
                                                    key={preference.action}
                                                    value={preference.action}
                                                >
                                                    {preference.action}
                                                </option>
                                            );
                                        }
                                    )}
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
