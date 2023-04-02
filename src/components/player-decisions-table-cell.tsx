import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
    getDisplayActions,
    getPlayerDecisionDealerCardPath,
    setPlayerFactOverride
} from '../logic';
import { Action } from '../models';
import {
    DealerFact,
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
    effectiveCode?: string;
    playerDecisionsEdit: boolean;
    playerFacts: PlayerFact[];
    processing: boolean;
}

const baseStyles: CSSProperties = {
    padding: '4px 0'
};

export const PlayerDecisionsTableCell = (props: PlayerDecisionsTableCellProps) => {
    const dealerCardKey = props.dealerFact.hand.codes.processing;
    const mainAction = props.playerFacts[0].vsDealerCard[dealerCardKey].preferences[0].action;
    const actionableFacts =
        mainAction === Action.hit || mainAction === Action.stand
            ? [props.playerFacts[0]]
            : props.playerFacts.filter((playerFact, index) => {
                  return (
                      index === 0 ||
                      playerFact.vsDealerCard[dealerCardKey].preferences[0].action !== mainAction
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
                                        props.playerFacts,
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
                                        <option key={preference.action} value={preference.action}>
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
                            props.effectiveCode || props.playerFacts[0].hand.codes.group,
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
