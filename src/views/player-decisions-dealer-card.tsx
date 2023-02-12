import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    DecisionsProbabilityBreakdown,
    FinalProbabilitiesGraph,
    InitialHandProbability,
    OutcomeComponent
} from '../components';
import { ScoreKey } from '../models';
import {
    AllScoreStatsChoicesSummary,
    OutcomesSet,
    PlayerSettings,
    ScoreStats,
    SplitOptions
} from '../types';

interface PlayerDecisionsDealerCardProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
    splitOptions: SplitOptions;
}

export const PlayerDecisionsDealerCard: React.FC<PlayerDecisionsDealerCardProps> = (props) => {
    const { dealerCardKey, scoreKey } = useParams() as {
        dealerCardKey: ScoreKey;
        scoreKey: ScoreKey;
    };
    const scoreStats = props.allScoreStats?.find((scoreStats) => scoreStats.key === scoreKey);
    const scoreStatsChoice =
        props.playerChoices?.choices[scoreKey].dealerCardChoices[dealerCardKey];

    const asd = scoreStatsChoice?.decisions[scoreStatsChoice.choice];

    const [displayCombinations, setDisplayCombinations] = useState(false);

    return (
        <div>
            <h3>
                {scoreKey} vs {dealerCardKey} player decisions
            </h3>
            <OutcomeComponent outcome={asd?.outcome} />
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
            {scoreStats && scoreStatsChoice && (
                <DecisionsProbabilityBreakdown
                    decisions={scoreStatsChoice.decisions}
                    scoreStats={scoreStats}
                />
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
        </div>
    );
};
