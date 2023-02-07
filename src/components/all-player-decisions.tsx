import React from 'react';
import { AllScoreStatsChoicesSummary, OutcomesSet, PlayerSettings, ScoreStats } from '../types';
import { PlayerDecisionsTable } from './player-decisions-table';

interface AllPlayerDecisionsComponentProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const AllPlayerDecisionsComponent: React.FC<AllPlayerDecisionsComponentProps> = (props) => {
    return (
        <div>
            <h3>Player decisions</h3>
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
