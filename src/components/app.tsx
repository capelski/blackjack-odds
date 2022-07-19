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

// TODO Compute overall loss

const parseHitMinimalProbabilityGain = (hitMinimalProbabilityGain: string) =>
    parseInt(hitMinimalProbabilityGain) / 100 || 0;

export const App: React.FC = () => {
    const [allScoreStats, setAllScoreStats] = useState<ScoreStats[]>();
    const [dealerProbabilities, setDealerProbabilities] =
        useState<AllEffectiveScoreProbabilities>();
    const [displayAdditionalProbabilities, setDisplayAdditionalProbabilities] = useState(false);
    const [hitMinimalProbabilityGain, setHitMinimalProbabilityGain] = useState('0');
    const [hitStrategy, setHitStrategy] = useState<HitStrategy>(HitStrategy.lowerThanDealer);
    const [oneMoreCardProbabilities, setOneMoreCardProbabilities] =
        useState<AllEffectiveScoreProbabilities>();
    const [outcomesSet, setOutcomesSet] = useState<OutcomesSet>();
    const [playerProbabilities, setPlayerProbabilities] =
        useState<AllScoreDealerCardBasedProbabilities>();

    useEffect(() => {
        const nextOutcomesSet = getOutcomesSet();
        const nextAllHands = getAllHands(nextOutcomesSet);
        const nextAllScoreStats = getAllScoreStats({
            allHands: nextAllHands,
            outcomesSet: nextOutcomesSet
        });
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
            dealerProbabilities: nextDealerProbabilities,
            hitMinimalProbabilityGain: parseHitMinimalProbabilityGain(hitMinimalProbabilityGain),
            hitStrategy,
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
                dealerProbabilities,
                hitMinimalProbabilityGain:
                    parseHitMinimalProbabilityGain(hitMinimalProbabilityGain),
                hitStrategy,
                outcomesSet
            });
            setPlayerProbabilities(nextPlayerProbabilities);
        }
    }, [hitMinimalProbabilityGain, hitStrategy]);

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
            <input
                max={100}
                min={0}
                onChange={(event) => setHitMinimalProbabilityGain(event.target.value)}
                style={{ textAlign: 'right' }}
                type="number"
                value={hitMinimalProbabilityGain}
            />
            % Minimal probability gain of Hitting over Standing
            <br />
            <br />
            <input
                type="checkbox"
                checked={displayAdditionalProbabilities}
                onChange={(event) => setDisplayAdditionalProbabilities(event.target.checked)}
            />
            Display additional probabilities (i.e. P({'≥'} D) and D({'>'}21) )
            <br />
            <br />
            {allScoreStats !== undefined &&
            outcomesSet !== undefined &&
            playerProbabilities !== undefined ? (
                <DealerCardBasedDecisionsTable
                    allScoreStats={allScoreStats}
                    displayAdditionalProbabilities={displayAdditionalProbabilities}
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
