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
    const [processing, setProcessing] = useState(true);
    const [splitAllowed, setSplitAllowed] = useState(true);
    const [standThreshold, setStandThreshold] = useState('16');

    // outcomesSet and dealerProbabilities are constant regardless the active settings
    useEffect(() => {
        const outcomesSet = getOutcomesSet();
        const allHands = getAllHands(outcomesSet, false);
        const allScoreStats = getAllScoreStats({
            allHands,
            outcomesSet
        });
        const dealerProbabilities = getStandThresholdProbabilities({
            allScoreStats: allScoreStats,
            outcomesSet,
            standThreshold: dealerStandThreshold
        });

        setDealerProbabilities(dealerProbabilities);
        setOutcomesSet(outcomesSet);
    }, []);

    // A change in settings disables further changes in settings until re-processing data
    // (could be done with a setTimeout, but safer to trigger an additional render cycle)
    useEffect(() => {
        setProcessing(true);
    }, [
        blackjackPayout,
        bustingThreshold,
        doublingMode,
        playerStrategy,
        playerDecisionsOverrides,
        splitAllowed,
        standThreshold
    ]);

    // allScoreStats and playerChoices must be recomputed upon settings change
    useEffect(() => {
        if (processing && outcomesSet !== undefined && dealerProbabilities !== undefined) {
            const nextAllHands = getAllHands(outcomesSet, splitAllowed);
            const nextAllScoreStats = getAllScoreStats({
                allHands: nextAllHands,
                outcomesSet
            });
            const nextPlayerChoices = getAllScoresStatsChoicesSummary({
                allScoreStats: nextAllScoreStats,
                blackjackPayout,
                bustingThreshold: parseBustingThreshold(bustingThreshold),
                dealerProbabilities,
                doublingMode,
                outcomesSet,
                playerDecisionsOverrides,
                playerStrategy,
                // splitAllowed,
                standThreshold: parseStandThreshold(standThreshold)
            });

            setAllScoreStats(nextAllScoreStats);
            setPlayerChoices(nextPlayerChoices);
            setProcessing(false);
        }
    }, [dealerProbabilities, outcomesSet, processing]);

    return (
        <div>
            <h3>Settings</h3>
            <p>Player strategy:</p>
            {Object.values(PlayerStrategy).map((playerStrategyOption) => (
                <React.Fragment key={playerStrategyOption}>
                    <input
                        checked={playerStrategy === playerStrategyOption}
                        disabled={processing}
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
                                disabled={
                                    processing || playerStrategy !== PlayerStrategy.standThreshold
                                }
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
                                disabled={
                                    processing || playerStrategy !== PlayerStrategy.bustingThreshold
                                }
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
                disabled={processing}
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
                checked={splitAllowed}
                disabled={processing}
                onChange={(event) => setSplitAllowed(event.target.checked)}
                type="checkbox"
            />
            Split allowed
            <br />
            <input
                checked={blackjackPayout}
                disabled={processing}
                onChange={(event) => setBlackjackPayout(event.target.checked)}
                type="checkbox"
            />
            Blackjack pays 3 to 2
            <br />
            <input
                checked={playerDecisionsEdit}
                disabled={processing}
                onChange={(event) => setPlayerDecisionsEdit(event.target.checked)}
                type="checkbox"
            />
            Edit player decisions{' '}
            <button
                disabled={processing || Object.keys(playerDecisionsOverrides).length === 0}
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
                    playerDecisionsEdit={!processing && playerDecisionsEdit}
                    playerDecisionsOverrides={playerDecisionsOverrides}
                    playerDecisionsOverridesSetter={setPlayerDecisionsOverrides}
                />
            ) : (
                'Processing...'
            )}
            <h3>Dealer cards</h3>
            {dealerProbabilities !== undefined && outcomesSet !== undefined ? (
                <DealerScoreStatsTable
                    dealerProbabilities={dealerProbabilities}
                    outcomeSet={outcomesSet}
                />
            ) : (
                'Processing...'
            )}
            <h3>Player scores</h3>
            {allScoreStats !== undefined ? (
                <PlayerScoreStatsTable allScoreStats={allScoreStats} />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
