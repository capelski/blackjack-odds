import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useParams } from 'react-router-dom';
import { InitialHandProbability, OutcomeComponent, PlayerDecisionsTable } from '../components';
import { desktopBreakpoint } from '../constants';
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
    outcomesSet: OutcomesSet;
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

    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });
    const [displayCombinations, setDisplayCombinations] = useState(false);

    return (
        <div>
            <h3>{scoreKey} player decisions</h3>
            <OutcomeComponent outcome={scoreStatsChoice?.decisionOutcome} />
            <h4>Dealer card based decisions</h4>
            {scoreStats && props.playerChoices !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    data={[scoreStats]}
                    direction={isDesktop ? 'horizontal' : 'vertical'}
                    playerChoices={props.playerChoices}
                />
            ) : (
                'Processing...'
            )}
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
        </div>
    );
};
