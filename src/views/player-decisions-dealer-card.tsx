import React from 'react';
import { useParams } from 'react-router-dom';
import {
    DecisionsProbabilityBreakdown,
    FinalProbabilitiesGraph,
    OutcomeComponent
} from '../components';
import { getDisplayPlayerDecision, getPrimaryPlayerDecisions } from '../logic';
import { PlayerDecision, ScoreKey } from '../models';
import { AllScoreStatsChoicesSummary, PlayerSettings, ScoreStats } from '../types';

interface PlayerDecisionsDealerCardProps {
    allScoreStats?: ScoreStats[];
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

    const decisionData = scoreStatsChoice?.decisions[scoreStatsChoice.choice];

    const allDecisionsData = scoreStatsChoice
        ? getPrimaryPlayerDecisions(scoreStatsChoice.decisions)
              .filter((x) => x !== PlayerDecision.stand)
              .map((playerDecision: PlayerDecision) => ({
                  decisionData: scoreStatsChoice.decisions[playerDecision],
                  playerDecision: getDisplayPlayerDecision(playerDecision, { simplify: true })
              }))
        : [];

    return (
        <div>
            <h3>
                {scoreKey} vs {dealerCardKey} player decisions
            </h3>
            <OutcomeComponent outcome={decisionData?.outcome} />
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
                allDecisionsData.length > 0 &&
                allDecisionsData.map((decision) => (
                    <React.Fragment key={decision.playerDecision}>
                        <h4>{decision.playerDecision} final score probabilities</h4>
                        <FinalProbabilitiesGraph
                            allScoreStats={props.allScoreStats!}
                            finalProbabilities={decision.decisionData.finalProbabilities}
                            scoreKey={scoreKey}
                        />
                        <br />
                        <br />
                    </React.Fragment>
                ))}
        </div>
    );
};
