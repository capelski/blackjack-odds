import React from 'react';
import { OutcomeComponent, PlayerDecisionsTable } from '../components';
import { AllScoreStatsChoicesSummary, OutcomesSet, PlayerSettings, ScoreStats } from '../types';

interface PlayerDecisionsAllProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const PlayerDecisionsAll: React.FC<PlayerDecisionsAllProps> = (props) => {
    return (
        <div>
            <h3>Player decisions</h3>
            <OutcomeComponent outcome={props.playerChoices?.outcome} />
            {props.outcomesSet !== undefined && props.playerChoices !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    allScoreStats={props.allScoreStats || []}
                    expandedCells={false}
                    outcomesSet={props.outcomesSet}
                    playerChoices={props.playerChoices}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
