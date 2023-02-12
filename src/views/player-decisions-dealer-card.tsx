import React from 'react';
import { useParams } from 'react-router-dom';
import {
    DecisionsProbabilityBreakdown,
    FinalProbabilitiesGraph,
    OutcomeComponent
} from '../components';
import { ScoreKey } from '../models';
import { AllScoreStatsChoicesSummary, OutcomesSet, PlayerSettings, ScoreStats } from '../types';

interface PlayerDecisionsDealerCardProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
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

    return (
        <div>
            <h3>
                {scoreKey} vs {dealerCardKey} player decisions
            </h3>
            <OutcomeComponent outcome={asd?.outcome} />
            {scoreStats && scoreStatsChoice && (
                <React.Fragment>
                    <DecisionsProbabilityBreakdown
                        decisions={scoreStatsChoice.decisions}
                        playerChoice={scoreStatsChoice.choice}
                        scoreStats={scoreStats}
                    />
                    <br />
                    <br />
                </React.Fragment>
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
