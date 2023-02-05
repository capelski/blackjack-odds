import React from 'react';
import { DoublingMode } from '../models';
import { CasinoRules } from '../types';

export interface CasinoRulesComponentProps {
    casinoRules: CasinoRules;
    casinoRulesSetter: (casinoRules: CasinoRules) => void;
    processing: boolean;
}

export const CasinoRulesComponent: React.FC<CasinoRulesComponentProps> = (props) => {
    return (
        <React.Fragment>
            <h3>Casino rules</h3>
            Doubling mode:{' '}
            <select
                disabled={props.processing}
                onChange={(event) => {
                    const nextDoublingMode = event.target.value as DoublingMode;
                    props.casinoRulesSetter({
                        ...props.casinoRules,
                        doublingMode: nextDoublingMode
                    });
                }}
                value={props.casinoRules.doublingMode}
            >
                {Object.values(DoublingMode).map((doublingMode) => (
                    <option key={doublingMode} value={doublingMode}>
                        {doublingMode}
                    </option>
                ))}
            </select>
            <br />
            <br />
            <input
                checked={props.casinoRules.splitOptions.allowed}
                disabled={props.processing}
                onChange={(event) => {
                    const nextSplitAllowed = event.target.checked;

                    props.casinoRulesSetter({
                        ...props.casinoRules,
                        splitOptions: {
                            allowed: nextSplitAllowed,
                            blackjackAfterSplit: nextSplitAllowed
                                ? props.casinoRules.splitOptions.blackjackAfterSplit
                                : false,
                            hitSplitAces: nextSplitAllowed
                                ? props.casinoRules.splitOptions.hitSplitAces
                                : false
                        }
                    });
                }}
                type="checkbox"
            />
            Split allowed
            <br />
            <br />
            <div style={{ paddingLeft: 24 }}>
                <input
                    checked={props.casinoRules.splitOptions.blackjackAfterSplit}
                    disabled={props.processing || !props.casinoRules.splitOptions.allowed}
                    onChange={(event) => {
                        props.casinoRulesSetter({
                            ...props.casinoRules,
                            splitOptions: {
                                ...props.casinoRules.splitOptions,
                                blackjackAfterSplit: event.target.checked
                            }
                        });
                    }}
                    type="checkbox"
                />
                Blackjack after split allowed (considered 21 otherwise)
                <br />
                <br />
                <input
                    checked={props.casinoRules.splitOptions.hitSplitAces}
                    disabled={props.processing || !props.casinoRules.splitOptions.allowed}
                    onChange={(event) => {
                        props.casinoRulesSetter({
                            ...props.casinoRules,
                            splitOptions: {
                                ...props.casinoRules.splitOptions,
                                hitSplitAces: event.target.checked
                            }
                        });
                    }}
                    type="checkbox"
                />
                Hit split Aces allowed (limiting to Stand or Split otherwise)
                <br />
                <br />
            </div>
            <input
                checked={props.casinoRules.blackjackPayout}
                disabled={props.processing}
                onChange={(event) => {
                    props.casinoRulesSetter({
                        ...props.casinoRules,
                        blackjackPayout: event.target.checked
                    });
                }}
                type="checkbox"
            />
            Blackjack pays 3 to 2
        </React.Fragment>
    );
};
