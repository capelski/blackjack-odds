import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DealerCards, Legend } from './components';
import { dealerStandThreshold } from './constants';
import {
    getAllHands,
    getAllScoresStatsChoicesSummary,
    getAllScoreStats,
    getDefaultCasinoRues,
    getDefaultPlayerSettings,
    getOutcomesSet,
    getStandThresholdProbabilities
} from './logic';
import { Paths, PlayerStrategy } from './models';
import {
    AllScoreStatsChoicesSummary,
    FinalScoresDictionary,
    OutcomesSet,
    ScoreStats
} from './types';
import { NavBar, PlayerDecisionsAll, PlayerDecisionsScore, StrategyAndRules } from './views';

export const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export const App: React.FC = () => {
    const [allScoreStats, setAllScoreStats] = useState<ScoreStats[]>();
    const [casinoRules, setCasinoRules] = useState(getDefaultCasinoRues());
    const [dealerProbabilities, setDealerProbabilities] = useState<FinalScoresDictionary>();
    const [outcomesSet, setOutcomesSet] = useState<OutcomesSet>();
    const [playerChoices, setPlayerChoices] = useState<AllScoreStatsChoicesSummary>();
    const [processing, setProcessing] = useState(true);
    const [playerSettings, setPlayerSettings] = useState(getDefaultPlayerSettings());

    // outcomesSet and dealerProbabilities are constant regardless the active settings
    useEffect(() => {
        const outcomesSet = getOutcomesSet();
        const allHands = getAllHands(outcomesSet, {
            allowed: false,
            blackjackAfterSplit: false,
            hitSplitAces: false
        });
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
    }, [casinoRules, playerSettings]);

    // allScoreStats and playerChoices must be recomputed upon settings change
    useEffect(() => {
        if (processing && outcomesSet !== undefined && dealerProbabilities !== undefined) {
            const effectiveSplitOptions = {
                ...casinoRules.splitOptions,
                allowed:
                    casinoRules.splitOptions.allowed &&
                    (playerSettings.playerStrategy ===
                        PlayerStrategy.maximumPayout_hit_stand_split ||
                        playerSettings.playerStrategy ===
                            PlayerStrategy.maximumPayout_hit_stand_double_split)
            };

            const nextAllHands = getAllHands(outcomesSet, effectiveSplitOptions);
            const nextAllScoreStats = getAllScoreStats({
                allHands: nextAllHands,
                outcomesSet
            });
            const nextPlayerChoices = getAllScoresStatsChoicesSummary({
                ...casinoRules,
                ...playerSettings,
                allScoreStats: nextAllScoreStats,
                dealerProbabilities,
                outcomesSet,
                splitOptions: effectiveSplitOptions
            });

            setAllScoreStats(nextAllScoreStats);
            setPlayerChoices(nextPlayerChoices);
            setProcessing(false);
        }
    }, [dealerProbabilities, outcomesSet, processing]);

    return (
        <div>
            <BrowserRouter basename="/blackjack-odds">
                <ScrollToTop />
                <NavBar />
                <Routes>
                    <Route
                        path={Paths.dealerCards}
                        element={
                            <React.Fragment>
                                <h3>Dealer cards</h3>
                                {dealerProbabilities !== undefined && outcomesSet !== undefined ? (
                                    <DealerCards
                                        dealerProbabilities={dealerProbabilities}
                                        outcomesSet={outcomesSet}
                                    />
                                ) : (
                                    'Processing...'
                                )}
                            </React.Fragment>
                        }
                    />
                    <Route path={Paths.legend} element={<Legend />} />
                    <Route
                        path={Paths.playerDecisions}
                        element={
                            <PlayerDecisionsAll
                                allScoreStats={allScoreStats}
                                outcomesSet={outcomesSet}
                                playerChoices={playerChoices}
                                playerSettings={playerSettings}
                                playerSettingsSetter={setPlayerSettings}
                                processing={processing}
                            />
                        }
                    />
                    <Route
                        path={Paths.scorePlayerDecisions}
                        element={
                            <PlayerDecisionsScore
                                allScoreStats={allScoreStats}
                                outcomesSet={outcomesSet}
                                playerChoices={playerChoices}
                                playerSettings={playerSettings}
                                playerSettingsSetter={setPlayerSettings}
                                processing={processing}
                            />
                        }
                    />
                    <Route
                        path={Paths.strategyAndRules}
                        element={
                            <StrategyAndRules
                                casinoRules={casinoRules}
                                casinoRulesSetter={setCasinoRules}
                                outcome={playerChoices?.outcome}
                                playerSettings={playerSettings}
                                playerSettingsSetter={setPlayerSettings}
                                processing={processing}
                            />
                        }
                    />
                    <Route path="*" element={<Navigate to={Paths.playerDecisions} />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};
