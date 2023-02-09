import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    FinalProbabilitiesGraph,
    InitialHandProbability,
    OutcomeComponent,
    PlayerDecisionsTable
} from '../components';
import { ScoreKey } from '../models';
import {
    AllScoreStatsChoicesSummary,
    OutcomesSet,
    PlayerSettings,
    ScoreStats,
    SplitOptions
} from '../types';

interface PlayerDecisionsScoreProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
    splitOptions: SplitOptions;
}

export const PlayerDecisionsScore: React.FC<PlayerDecisionsScoreProps> = (props) => {
    const { scoreKey } = useParams() as { scoreKey: ScoreKey };
    const scoreStats = props.allScoreStats?.find((scoreStats) => scoreStats.key === scoreKey);
    const scoreStatsChoice = props.playerChoices?.choices[scoreKey];

    const [displayCombinations, setDisplayCombinations] = useState(false);

    return (
        <div>
            <h3>{scoreKey} player decisions</h3>
            <OutcomeComponent outcome={scoreStatsChoice?.decisionOutcome} />
            <p>
                Initial hand probability:{' '}
                <span style={{ fontWeight: 'bold' }}>
                    <InitialHandProbability
                        allScoreStats={props.allScoreStats}
                        scoreStats={scoreStats}
                        splitOptions={props.splitOptions}
                    />
                </span>
            </p>
            <p>
                <span
                    onClick={() => {
                        setDisplayCombinations(!displayCombinations);
                    }}
                    style={{
                        cursor: 'pointer'
                    }}
                >
                    {displayCombinations ? '👇' : '👉'}
                </span>{' '}
                Card combinations ({scoreStats?.combinations.length || '-'})
            </p>
            {scoreStats && displayCombinations && (
                <ul>
                    {scoreStats.combinations.map((combination) => (
                        <li key={combination}>{combination}</li>
                    ))}
                </ul>
            )}
            {props.allScoreStats !== undefined &&
                scoreStatsChoice?.finalScoreProbabilities !== undefined && (
                    <React.Fragment>
                        <FinalProbabilitiesGraph
                            allScoreStats={props.allScoreStats}
                            finalProbabilities={scoreStatsChoice?.finalScoreProbabilities}
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
                    skipInitialColumns={true}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
