import React, { useState } from 'react';
import { AllScoreStatsChoicesSummary, OutcomesSet, PlayerSettings, ScoreStats } from '../types';
import { EditPlayerDecisions } from './edit-player-decisions';
import { OutcomeComponent } from './outcome';
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
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);

    return (
        <div>
            <h3>Player decisions</h3>
            <OutcomeComponent outcome={props.playerChoices?.outcome} />
            <br />
            <br />
            <EditPlayerDecisions
                playerDecisionsEdit={playerDecisionsEdit}
                playerDecisionsEditSetter={setPlayerDecisionsEdit}
                playerSettings={props.playerSettings}
                playerSettingsSetter={props.playerSettingsSetter}
                processing={props.processing}
            />
            <br />
            <br />
            {props.outcomesSet !== undefined && props.playerChoices !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    allScoreStats={props.allScoreStats || []}
                    expandedCells={false}
                    outcomesSet={props.outcomesSet}
                    playerChoices={props.playerChoices}
                    playerDecisionsEdit={playerDecisionsEdit}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
