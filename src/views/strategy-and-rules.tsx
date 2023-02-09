import React from 'react';
import { CasinoRulesComponent, PlayerStrategyComponent, OutcomeComponent } from '../components';
import { isSplitInUse } from '../logic/split-options';
import { CasinoRules, DecisionOutcome, PlayerSettings } from '../types';

interface StrategyAndRulesProps {
    casinoRules: CasinoRules;
    casinoRulesSetter: (casinoRules: CasinoRules) => void;
    outcome?: DecisionOutcome;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const StrategyAndRules: React.FC<StrategyAndRulesProps> = (props) => {
    const playerSettingsSetter = (playerSettings: PlayerSettings) => {
        props.playerSettingsSetter(playerSettings);
        props.casinoRulesSetter({
            ...props.casinoRules,
            splitOptions: {
                ...props.casinoRules.splitOptions,
                inUse: isSplitInUse(playerSettings.playerStrategy)
            }
        });
    };

    return (
        <React.Fragment>
            <CasinoRulesComponent
                casinoRules={props.casinoRules}
                casinoRulesSetter={props.casinoRulesSetter}
                processing={props.processing}
            />
            <PlayerStrategyComponent
                playerSettings={props.playerSettings}
                playerSettingsSetter={playerSettingsSetter}
                processing={props.processing}
            />
            <br />
            <br />
            <OutcomeComponent outcome={props.outcome} />
        </React.Fragment>
    );
};
