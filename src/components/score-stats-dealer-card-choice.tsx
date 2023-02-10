import React from 'react';
import { CellProps } from 'react-table';
import { getDisplayPlayerDecision } from '../logic';
import { PlayerDecision } from '../models';
import { AllScoreStatsChoicesSummary, CardOutcome, PlayerSettings, ScoreStats } from '../types';
import { DecisionsProbabilityBreakdown } from './decisions-probability-breakdown';

interface ScoreStatsDealerCardChoiceCellProps {
    dealerCard: CardOutcome;
    isDesktop: boolean;
    isExpanded: boolean;
    playerChoices: AllScoreStatsChoicesSummary;
    playerDecisionsEdit: boolean;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const ScoreStatsDealerCardChoiceCell = (props: ScoreStatsDealerCardChoiceCellProps) => {
    return (cellProps: CellProps<ScoreStats>) => {
        const { key: scoreKey } = cellProps.row.original;
        const scoreStatsChoice = props.playerChoices.choices[scoreKey];

        /* scoreStatsChoice might be undefined during settings re-processing */
        if (!scoreStatsChoice) {
            return <div key={props.dealerCard.symbol}>-</div>;
        }

        const { choice, decisions } = scoreStatsChoice.dealerCardChoices[props.dealerCard.key];

        return (
            <div key={props.dealerCard.symbol}>
                <div>
                    {!props.processing && props.playerDecisionsEdit ? (
                        <select
                            onChange={(event) => {
                                props.playerSettingsSetter({
                                    ...props.playerSettings,
                                    playerDecisionsOverrides: {
                                        ...props.playerSettings.playerDecisionsOverrides,
                                        [scoreKey]: {
                                            ...props.playerSettings.playerDecisionsOverrides[
                                                scoreKey
                                            ],
                                            [props.dealerCard.key]: event.target
                                                .value as PlayerDecision
                                        }
                                    }
                                });
                            }}
                            value={choice}
                        >
                            {Object.keys(decisions)
                                .filter(
                                    (playerDecision: PlayerDecision) =>
                                        decisions[playerDecision].available
                                )
                                .map((playerDecision) => {
                                    const option = getDisplayPlayerDecision(
                                        playerDecision as PlayerDecision,
                                        { isDesktop: props.isDesktop }
                                    );

                                    return (
                                        <option key={option} value={playerDecision}>
                                            {option}
                                        </option>
                                    );
                                })}
                        </select>
                    ) : (
                        getDisplayPlayerDecision(choice, { isDesktop: props.isDesktop })
                    )}
                </div>
                {props.isExpanded && (
                    <div
                        style={{
                            paddingLeft: 4,
                            paddingTop: 16,
                            textAlign: 'left'
                        }}
                    >
                        <DecisionsProbabilityBreakdown
                            decisions={decisions}
                            scoreStats={cellProps.row.original}
                        />
                    </div>
                )}
            </div>
        );
    };
};
