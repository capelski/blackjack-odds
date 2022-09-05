import React, { useEffect, useState } from 'react';
import { dealerStandThreshold } from '../constants';
import {
    getAllHands,
    getAllScoresStatsChoicesSummary,
    getAllScoreStats,
    getOutcomesSet,
    getStandThresholdProbabilities,
    playerStrategyLegend
} from '../logic';
import { DoublingMode, PlayerStrategy } from '../models';
import {
    AllScoreStatsChoicesSummary,
    FinalScoresDictionary,
    OutcomesSet,
    PlayerDecisionsOverrides,
    ScoreStats
} from '../types';
import { DealerScoreStatsTable } from './dealer-score-stats-table';
import { PlayerScoreStatsTable } from './player-score-stats-table';
import { ScoreStatsChoicesTable } from './score-stats-choices-table';

export const App: React.FC = () => {
    const [allScoreStats, setAllScoreStats] = useState<ScoreStats[]>();
    const [blackjackPayout, setBlackjackPayout] = useState(true);
    const [dealerProbabilities, setDealerProbabilities] = useState<FinalScoresDictionary>();
    const [doublingMode, setDoublingMode] = useState<DoublingMode>(
        DoublingMode.nine_ten_eleven_plus_soft
    );
    const [outcomesSet, setOutcomesSet] = useState<OutcomesSet>();
    const [playerChoices, setPlayerChoices] = useState<AllScoreStatsChoicesSummary>();
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);
    const [playerDecisionsOverrides, setPlayerDecisionsOverrides] =
        useState<PlayerDecisionsOverrides>({});
    const [playerStrategy, setPlayerStrategy] = useState<PlayerStrategy>(
        PlayerStrategy.doubleLossMinusWin_hitLossMinusWin_standLossMinusWin
    );

    useEffect(() => {
        const nextOutcomesSet = getOutcomesSet();
        const nextAllHands = getAllHands(nextOutcomesSet);
        const nextAllScoreStats = getAllScoreStats({
            allHands: nextAllHands,
            outcomesSet: nextOutcomesSet
        });
        const nextDealerProbabilities = getStandThresholdProbabilities({
            allScoreStats: nextAllScoreStats,
            outcomesSet: nextOutcomesSet,
            standThreshold: dealerStandThreshold
        });
        const nextPlayerChoices = getAllScoresStatsChoicesSummary({
            allScoreStats: nextAllScoreStats,
            blackjackPayout: blackjackPayout,
            dealerProbabilities: nextDealerProbabilities,
            doublingMode,
            outcomesSet: nextOutcomesSet,
            playerDecisionsOverrides,
            playerStrategy
        });

        setOutcomesSet(nextOutcomesSet);
        setAllScoreStats(nextAllScoreStats);
        setDealerProbabilities(nextDealerProbabilities);
        setPlayerChoices(nextPlayerChoices);
    }, []);

    useEffect(() => {
        if (
            allScoreStats !== undefined &&
            dealerProbabilities !== undefined &&
            outcomesSet !== undefined
        ) {
            const nextPlayerChoices = getAllScoresStatsChoicesSummary({
                allScoreStats,
                blackjackPayout,
                dealerProbabilities,
                doublingMode,
                outcomesSet,
                playerDecisionsOverrides,
                playerStrategy
            });
            setPlayerChoices(nextPlayerChoices);
        }
    }, [blackjackPayout, doublingMode, playerStrategy, playerDecisionsOverrides]);

    return (
        <div>
            <h3>Settings</h3>
            <p>Player strategy:</p>
            {Object.values(PlayerStrategy).map((playerStrategyOption) => (
                <React.Fragment key={playerStrategyOption}>
                    <input
                        checked={playerStrategy === playerStrategyOption}
                        name="hit-strategy"
                        onChange={(option) =>
                            setPlayerStrategy(option.target.value as PlayerStrategy)
                        }
                        type="radio"
                        value={playerStrategyOption}
                    />
                    {playerStrategyLegend[playerStrategyOption]}
                    <br />
                </React.Fragment>
            ))}
            <br />
            <input
                type="checkbox"
                checked={blackjackPayout}
                onChange={(event) => setBlackjackPayout(event.target.checked)}
            />
            Blackjack pays 3 to 2
            <br />
            <br />
            Doubling mode:{' '}
            <select
                onChange={(event) => {
                    setDoublingMode(event.target.value as DoublingMode);
                }}
                value={doublingMode}
            >
                {Object.values(DoublingMode).map((doublingMode) => (
                    <option key={doublingMode} value={doublingMode}>
                        {doublingMode}
                    </option>
                ))}
            </select>
            <br />
            <br />
            <input
                type="checkbox"
                checked={playerDecisionsEdit}
                onChange={(event) => setPlayerDecisionsEdit(event.target.checked)}
            />
            Edit player decisions{' '}
            <button
                disabled={Object.keys(playerDecisionsOverrides).length === 0}
                onClick={() => {
                    setPlayerDecisionsOverrides({});
                }}
                type="button"
            >
                Clear edits
            </button>
            <br />
            <br />
            <h3>Dealer card based decisions table</h3>
            {allScoreStats !== undefined &&
            outcomesSet !== undefined &&
            playerChoices !== undefined ? (
                <ScoreStatsChoicesTable
                    allScoreStats={allScoreStats}
                    outcomesSet={outcomesSet}
                    playerChoices={playerChoices}
                    playerDecisionsEdit={playerDecisionsEdit}
                    playerDecisionsOverrides={playerDecisionsOverrides}
                    playerDecisionsOverridesSetter={setPlayerDecisionsOverrides}
                />
            ) : (
                'Loading...'
            )}
            <h3>Dealer cards</h3>
            {dealerProbabilities !== undefined && outcomesSet !== undefined ? (
                <DealerScoreStatsTable
                    dealerProbabilities={dealerProbabilities}
                    outcomeSet={outcomesSet}
                />
            ) : (
                'Loading...'
            )}
            <h3>Player scores</h3>
            {allScoreStats !== undefined ? (
                <PlayerScoreStatsTable allScoreStats={allScoreStats} />
            ) : (
                'Loading...'
            )}
        </div>
    );
};
