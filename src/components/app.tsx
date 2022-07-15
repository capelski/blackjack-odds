import React, { useEffect, useState } from 'react';
import { dealerStandThreshold } from '../constants';
import {
    getOutcomesSet,
    getAllHands,
    getAllScoreStats,
    getOneMoreCardProbabilities,
    getStandThresholdProbabilities,
    getDealerCardBasedProbabilities
} from '../logic';
import { HitStrategy } from '../models';
import {
    AllEffectiveScoreProbabilities,
    AllScoreDealerCardBasedProbabilities,
    OutcomesSet,
    ScoreStats
} from '../types';
import { AllScoreStatsTable } from './all-score-stats-table';
import { DealerCardBasedDecisionsTable } from './dealer-card-based-decisions-table';

// TODO P(< D) on hit
// TODO Compute turnover

export const App: React.FC = () => {
    const [hitStrategy, setHitStrategy] = useState<HitStrategy>(HitStrategy.includeLowerScore);
    const [allScoreStats, setAllScoreStats] = useState<ScoreStats[]>();
    const [dealerProbabilities, setDealerProbabilities] =
        useState<AllEffectiveScoreProbabilities>();
    const [oneMoreCardProbabilities, setOneMoreCardProbabilities] =
        useState<AllEffectiveScoreProbabilities>();
    const [outcomesSet, setOutcomesSet] = useState<OutcomesSet>();
    const [playerProbabilities, setPlayerProbabilities] =
        useState<AllScoreDealerCardBasedProbabilities>();

    useEffect(() => {
        const nextOutcomesSet = getOutcomesSet();
        const nextAllHands = getAllHands(nextOutcomesSet);
        const nextAllScoreStats = getAllScoreStats(nextAllHands);
        const nextOneMoreCardProbabilities = getOneMoreCardProbabilities({
            allScoreStats: nextAllScoreStats,
            outcomesSet: nextOutcomesSet
        });
        const nextDealerProbabilities = getStandThresholdProbabilities({
            allScoreStats: nextAllScoreStats,
            outcomesSet: nextOutcomesSet,
            standThreshold: dealerStandThreshold
        });
        const nextPlayerProbabilities = getDealerCardBasedProbabilities({
            allScoreStats: nextAllScoreStats,
            hitStrategy,
            dealerProbabilities: nextDealerProbabilities,
            outcomesSet: nextOutcomesSet
        });

        setOutcomesSet(nextOutcomesSet);
        setAllScoreStats(nextAllScoreStats);
        setOneMoreCardProbabilities(nextOneMoreCardProbabilities);
        setDealerProbabilities(nextDealerProbabilities);
        setPlayerProbabilities(nextPlayerProbabilities);
    }, []);

    useEffect(() => {
        if (
            allScoreStats !== undefined &&
            outcomesSet !== undefined &&
            dealerProbabilities !== undefined
        ) {
            const nextPlayerProbabilities = getDealerCardBasedProbabilities({
                allScoreStats,
                hitStrategy,
                dealerProbabilities,
                outcomesSet
            });
            setPlayerProbabilities(nextPlayerProbabilities);
        }
    }, [hitStrategy]);

    return (
        <div>
            <h3>Dealer card based decisions table</h3>
            {Object.values(HitStrategy).map((hitStrategyOption) => (
                <React.Fragment key={hitStrategyOption}>
                    <input
                        checked={hitStrategy === hitStrategyOption}
                        name="hit-strategy"
                        onChange={(option) => setHitStrategy(option.target.value as HitStrategy)}
                        type="radio"
                        value={hitStrategyOption}
                    />
                    {hitStrategyOption}
                    <br />
                </React.Fragment>
            ))}
            <br />
            {allScoreStats !== undefined &&
            outcomesSet !== undefined &&
            playerProbabilities !== undefined ? (
                <DealerCardBasedDecisionsTable
                    allScoreStats={allScoreStats}
                    outcomesSet={outcomesSet}
                    playerProbabilities={playerProbabilities}
                />
            ) : (
                'Loading...'
            )}

            <h3>Scores table</h3>
            {allScoreStats !== undefined &&
            dealerProbabilities !== undefined &&
            oneMoreCardProbabilities !== undefined ? (
                <AllScoreStatsTable
                    allScoreStats={allScoreStats}
                    dealerProbabilities={dealerProbabilities}
                    oneMoreCardProbabilities={oneMoreCardProbabilities}
                />
            ) : (
                'Loading...'
            )}
        </div>
    );
};
