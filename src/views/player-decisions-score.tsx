import React from 'react';
import { useParams } from 'react-router-dom';
import { OutcomeComponent, FinalProbabilitiesGraph, PlayerDecisionsTable } from '../components';
import { ScoreKey } from '../models';
import { AllScoreStatsChoicesSummary, OutcomesSet, PlayerSettings, ScoreStats } from '../types';

interface PlayerDecisionsScoreProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const PlayerDecisionsScore: React.FC<PlayerDecisionsScoreProps> = (props) => {
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
            {props.outcomesSet !== undefined && props.playerChoices !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    allScoreStats={scoreStats ? [scoreStats] : []}
                    expandedCells={true}
                    outcomesSet={props.outcomesSet}
                    playerChoices={props.playerChoices}
                    skipIndexColumn={true}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
