import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ScoreKey } from '../models';
import { AllScoreStatsChoicesSummary, OutcomesSet, PlayerSettings, ScoreStats } from '../types';
import { EditPlayerDecisions } from './edit-player-decisions';
import { FinalProbabilitiesGraph } from './final-probabilities-graph';
import { OutcomeComponent } from './outcome';
import { PlayerDecisionsTable } from './player-decisions-table';

interface ScorePlayerDecisionsComponentProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const ScorePlayerDecisionsComponent: React.FC<ScorePlayerDecisionsComponentProps> = (
    props
) => {
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);

    const { scoreKey } = useParams() as { scoreKey: ScoreKey };
    const scoreStats = props.allScoreStats?.find((scoreStats) => scoreStats.key === scoreKey);
    const finalProbabilities = props.playerChoices?.choices[scoreKey]?.finalScoreProbabilities;

    return (
        <div>
            <h3>{scoreKey} player decisions</h3>
            <OutcomeComponent outcome={props.playerChoices?.choices[scoreKey]?.decisionOutcome} />
            <br />
            <br />
            {props.allScoreStats !== undefined && finalProbabilities !== undefined && (
                <React.Fragment>
                    <FinalProbabilitiesGraph
                        allScoreStats={props.allScoreStats}
                        finalProbabilities={finalProbabilities}
                        scoreKey={scoreKey}
                    />
                    <br />
                    <br />
                </React.Fragment>
            )}
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
                    allScoreStats={scoreStats ? [scoreStats] : []}
                    expandedCells={true}
                    outcomesSet={props.outcomesSet}
                    playerChoices={props.playerChoices}
                    playerDecisionsEdit={playerDecisionsEdit}
                    skipIndexColumn={true}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
