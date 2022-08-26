import React, { useEffect, useState } from 'react';
import { dealerStandThreshold } from '../constants';
import {
    getOutcomesSet,
    getAllHands,
    getAllScoreStats,
    getStandThresholdProbabilities,
    getDealerCardBasedProbabilities
} from '../logic';
import { PlayerStrategy } from '../models';
import {
    AllEffectiveScoreProbabilities,
    AllScoreDealerCardBasedProbabilities,
    OutcomesSet,
    PlayerDecisionsOverrides,
    ScoreStats
} from '../types';
import { DealerCardBasedDecisionsTable } from './dealer-card-based-decisions-table';
import { DealerScoreStatsTable } from './dealer-score-stats-table';
import { PlayerScoreStatsTable } from './player-score-stats-table';

const parseHitMinimalProbabilityGain = (hitMinimalProbabilityGain: string) =>
    parseInt(hitMinimalProbabilityGain) / 100 || 0;

export const App: React.FC = () => {
    const [allScoreStats, setAllScoreStats] = useState<ScoreStats[]>();
    const [dealerProbabilities, setDealerProbabilities] =
        useState<AllEffectiveScoreProbabilities>();
    const [displayAdditionalProbabilities, setDisplayAdditionalProbabilities] = useState(false);
    const [hitMinimalProbabilityGain, setHitMinimalProbabilityGain] = useState('0');
    // const [oneMoreCardProbabilities, setOneMoreCardProbabilities] =
    //     useState<AllEffectiveScoreProbabilities>();
    const [outcomesSet, setOutcomesSet] = useState<OutcomesSet>();
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);
    const [playerDecisionsOverrides, setPlayerDecisionsOverrides] =
        useState<PlayerDecisionsOverrides>({});
    const [playerProbabilities, setPlayerProbabilities] =
        useState<AllScoreDealerCardBasedProbabilities>();
    const [playerStrategy, setPlayerStrategy] = useState<PlayerStrategy>(
        PlayerStrategy.winPushProbabilityComparison
    );

    useEffect(() => {
        const nextOutcomesSet = getOutcomesSet();
        const nextAllHands = getAllHands(nextOutcomesSet);
        const nextAllScoreStats = getAllScoreStats({
            allHands: nextAllHands,
            outcomesSet: nextOutcomesSet
        });
        // const nextOneMoreCardProbabilities = getOneMoreCardProbabilities({
        //     allScoreStats: nextAllScoreStats,
        //     outcomesSet: nextOutcomesSet
        // });
        const nextDealerProbabilities = getStandThresholdProbabilities({
            allScoreStats: nextAllScoreStats,
            outcomesSet: nextOutcomesSet,
            standThreshold: dealerStandThreshold
        });
        const nextPlayerProbabilities = getDealerCardBasedProbabilities({
            allScoreStats: nextAllScoreStats,
            dealerProbabilities: nextDealerProbabilities,
            hitMinimalProbabilityGain: parseHitMinimalProbabilityGain(hitMinimalProbabilityGain),
            outcomesSet: nextOutcomesSet,
            playerDecisionsOverrides,
            playerStrategy
        });

        setOutcomesSet(nextOutcomesSet);
        setAllScoreStats(nextAllScoreStats);
        // setOneMoreCardProbabilities(nextOneMoreCardProbabilities);
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
                outcomesSet,
                playerDecisionsOverrides,
                playerStrategy
            });
            setPlayerProbabilities(nextPlayerProbabilities);
        }
    }, [hitMinimalProbabilityGain, playerStrategy, playerDecisionsOverrides]);

    return (
        <div>
            <h3>Settings</h3>
            <p>Player strategy:</p>
            {Object.values(PlayerStrategy).map((hitStrategyOption) => (
                <React.Fragment key={hitStrategyOption}>
                    <input
                        checked={playerStrategy === hitStrategyOption}
                        name="hit-strategy"
                        onChange={(option) =>
                            setPlayerStrategy(option.target.value as PlayerStrategy)
                        }
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
            Display additional probabilities (i.e. P({'='} D), P({'>'} D) and D({'>'}21) )
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
            playerProbabilities !== undefined ? (
                <DealerCardBasedDecisionsTable
                    allScoreStats={allScoreStats}
                    displayAdditionalProbabilities={displayAdditionalProbabilities}
                    outcomesSet={outcomesSet}
                    playerDecisionsEdit={playerDecisionsEdit}
                    playerDecisionsOverrides={playerDecisionsOverrides}
                    playerDecisionsOverridesSetter={setPlayerDecisionsOverrides}
                    playerProbabilities={playerProbabilities}
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
