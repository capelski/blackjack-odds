import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { dealerStandThreshold } from '../constants';
import {
    getAllHands,
    getAllScoresStatsChoicesSummary,
    getAllScoreStats,
    getDefaultCasinoRues,
    getDefaultPlayerSettings,
    getOutcomesSet,
    getStandThresholdProbabilities
} from '../logic';
import { Paths } from '../models';
import {
    AllScoreStatsChoicesSummary,
    FinalScoresDictionary,
    OutcomesSet,
    ScoreStats
} from '../types';
import { CasinoRulesComponent } from './casino-rules';
import { DealerCards } from './dealer-cards';
import { Legend } from './legend';
import { NavBar } from './nav-bar';
import { PlayerDecisionsComponent } from './player-decisions';
import { PlayerScores } from './player-scores';
import { PlayerStrategyComponent } from './player-strategy';

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
            const nextAllHands = getAllHands(outcomesSet, casinoRules.splitOptions);
            const nextAllScoreStats = getAllScoreStats({
                allHands: nextAllHands,
                outcomesSet
            });
            const nextPlayerChoices = getAllScoresStatsChoicesSummary({
                ...casinoRules,
                ...playerSettings,
                allScoreStats: nextAllScoreStats,
                dealerProbabilities,
                outcomesSet
            });

            setAllScoreStats(nextAllScoreStats);
            setPlayerChoices(nextPlayerChoices);
            setProcessing(false);
        }
    }, [dealerProbabilities, outcomesSet, processing]);

    return (
        <div>
            <BrowserRouter basename="/blackjack-odds">
                <NavBar />
                <Routes>
                    <Route
                        path={Paths.casinoRules}
                        element={
                            <CasinoRulesComponent
                                casinoRules={casinoRules}
                                casinoRulesSetter={setCasinoRules}
                                processing={processing}
                            />
                        }
                    />
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
                            <React.Fragment>
                                <PlayerStrategyComponent
                                    playerSettings={playerSettings}
                                    playerSettingsSetter={setPlayerSettings}
                                    processing={processing}
                                />
                                <PlayerDecisionsComponent
                                    allScoreStats={allScoreStats}
                                    outcomesSet={outcomesSet}
                                    playerChoices={playerChoices}
                                    playerSettings={playerSettings}
                                    playerSettingsSetter={setPlayerSettings}
                                    processing={processing}
                                />
                            </React.Fragment>
                        }
                    />
                    <Route
                        path={Paths.playerScores}
                        element={
                            <React.Fragment>
                                <h3>Player scores</h3>
                                {allScoreStats !== undefined ? (
                                    <PlayerScores allScoreStats={allScoreStats} />
                                ) : (
                                    'Processing...'
                                )}
                            </React.Fragment>
                        }
                    />
                    <Route path="*" element={<Navigate to={Paths.playerDecisions} />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};
