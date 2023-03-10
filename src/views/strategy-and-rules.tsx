import React from 'react';
import { CasinoRulesComponent, PlayerStrategyComponent, OutcomeComponent } from '../components';
import { CasinoRules, PlayerBaseData, PlayerStrategyData } from '../types';

interface StrategyAndRulesProps {
    casinoRules: CasinoRules;
    casinoRulesSetter: (casinoRules: CasinoRules) => void;
    playerBaseData?: PlayerBaseData;
    playerStrategy: PlayerStrategyData;
    playerStrategySetter: (playerStrategy: PlayerStrategyData) => void;
    processing: boolean;
}

export const StrategyAndRules: React.FC<StrategyAndRulesProps> = (props) => {
    return (
        <React.Fragment>
            <CasinoRulesComponent
                casinoRules={props.casinoRules}
                casinoRulesSetter={props.casinoRulesSetter}
                processing={props.processing}
            />
            <PlayerStrategyComponent
                playerStrategy={props.playerStrategy}
                playerStrategySetter={props.playerStrategySetter}
                processing={props.processing}
            />
            <br />
            <OutcomeComponent outcome={props.playerBaseData?.vsDealerOutcome} />
        </React.Fragment>
    );
};
