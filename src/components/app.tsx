import React, { useEffect, useState } from 'react';
import { dealerStandThreshold, maximumScore } from '../constants';
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

const parseBustingThreshold = (bustingThreshold: string) => {
    const parsedThreshold = parseFloat(bustingThreshold) ?? 50;
    const effectiveThreshold = Math.min(100, Math.max(0, parsedThreshold));
    return effectiveThreshold;
};

const parseStandThreshold = (standThreshold: string) => {
    const parsedThreshold = parseInt(standThreshold) || 16;
    const effectiveThreshold = Math.min(maximumScore, Math.max(4, parsedThreshold));
    return effectiveThreshold;
};

export const App: React.FC = () => {
    const [allScoreStats, setAllScoreStats] = useState<ScoreStats[]>();
    const [blackjackPayout, setBlackjackPayout] = useState(true);
    const [bustingThreshold, setBustingThreshold] = useState('50');
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
    const [standThreshold, setStandThreshold] = useState('16');

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
            bustingThreshold: parseBustingThreshold(bustingThreshold),
            dealerProbabilities: nextDealerProbabilities,
            doublingMode,
            outcomesSet: nextOutcomesSet,
            playerDecisionsOverrides,
            playerStrategy,
            standThreshold: parseStandThreshold(standThreshold)
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
                bustingThreshold: parseBustingThreshold(bustingThreshold),
                dealerProbabilities,
                doublingMode,
                outcomesSet,
                playerDecisionsOverrides,
                playerStrategy,
                standThreshold: parseStandThreshold(standThreshold)
            });
            setPlayerChoices(nextPlayerChoices);
        }
    }, [
        blackjackPayout,
        bustingThreshold,
        doublingMode,
        playerStrategy,
        playerDecisionsOverrides,
        standThreshold
    ]);

    return (
        <div>
            <h3>Settings</h3>
            <p>Player strategy:</p>
            {Object.values(PlayerStrategy).map((playerStrategyOption) => (
                <React.Fragment key={playerStrategyOption}>
                    <input
                        checked={playerStrategy === playerStrategyOption}
                        name="player-strategy"
                        onChange={(option) =>
                            setPlayerStrategy(option.target.value as PlayerStrategy)
                        }
                        type="radio"
                        value={playerStrategyOption}
                    />
                    {playerStrategyLegend[playerStrategyOption]}

                    {playerStrategyOption === PlayerStrategy.standThreshold && (
                        <React.Fragment>
                            <input
                                disabled={playerStrategy !== PlayerStrategy.standThreshold}
                                onBlur={() => {
                                    setStandThreshold(String(parseStandThreshold(standThreshold)));
                                }}
                                onChange={(event) => {
                                    setStandThreshold(event.target.value);
                                }}
                                type="number"
                                value={standThreshold}
                                style={{ width: 40 }}
                            />{' '}
                            (4 to 21)
                        </React.Fragment>
                    )}

                    {playerStrategyOption === PlayerStrategy.bustingThreshold && (
                        <React.Fragment>
                            <input
                                disabled={playerStrategy !== PlayerStrategy.bustingThreshold}
                                onBlur={() => {
                                    setBustingThreshold(
                                        String(parseBustingThreshold(bustingThreshold))
                                    );
                                }}
                                onChange={(event) => {
                                    setBustingThreshold(event.target.value);
                                }}
                                step={10}
                                type="number"
                                value={bustingThreshold}
                                style={{ width: 40 }}
                            />
                            % (0 to 100)
                        </React.Fragment>
                    )}

                    <br />
                </React.Fragment>
            ))}
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
            <input
                type="checkbox"
                checked={blackjackPayout}
                onChange={(event) => setBlackjackPayout(event.target.checked)}
            />
            Blackjack pays 3 to 2
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
