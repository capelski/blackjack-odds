import React from 'react';
import { displayDoublingModes, DoublingMode } from '../models';
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
            <ul>
                <li>
                    {' '}
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
                                {displayDoublingModes[doublingMode]}
                            </option>
                        ))}
                    </select>
                    <br />
                    <br />
                </li>
                <li>
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
                                    doubleAfterSplit: nextSplitAllowed
                                        ? props.casinoRules.splitOptions.doubleAfterSplit
                                        : false,
                                    hitSplitAces: nextSplitAllowed
                                        ? props.casinoRules.splitOptions.hitSplitAces
                                        : false
                                }
                            });
                        }}
                        type="checkbox"
                    />
                    Split
                    <br />
                    <br />
                    <input
                        checked={props.casinoRules.splitOptions.doubleAfterSplit}
                        disabled={props.processing || !props.casinoRules.splitOptions.allowed}
                        onChange={(event) => {
                            props.casinoRulesSetter({
                                ...props.casinoRules,
                                splitOptions: {
                                    ...props.casinoRules.splitOptions,
                                    doubleAfterSplit: event.target.checked
                                }
                            });
                        }}
                        type="checkbox"
                    />
                    Doubling after split
                    <br />
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
                </li>
                <li>
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
                </li>
            </ul>
        </React.Fragment>
    );
};
