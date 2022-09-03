import React, { useEffect, useState } from 'react';
import { dealerStandThreshold } from '../constants';
import {
    getAllHands,
    getAllScoresStatsChoicesSummary,
    getAllScoreStats,
    getOutcomesSet,
    getStandThresholdProbabilities
} from '../logic';
import { PlayerDecision, PlayerStrategy, playerStrategyLegend } from '../models';
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

const parseHitMinimalProbabilityGain = (hitMinimalProbabilityGain: string) =>
    parseInt(hitMinimalProbabilityGain) / 100 || 0;

export const App: React.FC = () => {
    const [allScoreStats, setAllScoreStats] = useState<ScoreStats[]>();
    const [blackjackPayout, setBlackjackPayout] = useState(true);
    const [dealerProbabilities, setDealerProbabilities] = useState<FinalScoresDictionary>();
    const [hitMinimalProbabilityGain, setHitMinimalProbabilityGain] = useState('0');
    // const [oneMoreCardProbabilities, setOneMoreCardProbabilities] =
    //     useState<FinalScoresDictionary>();
    const [outcomesSet, setOutcomesSet] = useState<OutcomesSet>();
    const [playerChoices, setPlayerChoices] = useState<AllScoreStatsChoicesSummary>();
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);
    const [playerDecisionsOverrides, setPlayerDecisionsOverrides] =
        useState<PlayerDecisionsOverrides>({});
    const [playerStrategy, setPlayerStrategy] = useState<PlayerStrategy>(
        PlayerStrategy.hitLossMinusWin_standLossMinusWin
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
        const nextPlayerChoices = getAllScoresStatsChoicesSummary({
            allScoreStats: nextAllScoreStats,
            blackjackPayout: blackjackPayout,
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
        setPlayerChoices(nextPlayerChoices);
    }, []);

    useEffect(() => {
        if (
            allScoreStats !== undefined &&
            outcomesSet !== undefined &&
            dealerProbabilities !== undefined
        ) {
            const nextPlayerChoices = getAllScoresStatsChoicesSummary({
                allScoreStats,
                blackjackPayout,
                dealerProbabilities,
                hitMinimalProbabilityGain:
                    parseHitMinimalProbabilityGain(hitMinimalProbabilityGain),
                outcomesSet,
                playerDecisionsOverrides,
                playerStrategy
            });
            setPlayerChoices(nextPlayerChoices);
        }
    }, [blackjackPayout, hitMinimalProbabilityGain, playerStrategy, playerDecisionsOverrides]);

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
            <input
                max={100}
                min={0}
                onChange={(event) => setHitMinimalProbabilityGain(event.target.value)}
                style={{ textAlign: 'right' }}
                type="number"
                value={hitMinimalProbabilityGain}
            />
            % Minimal probability gain of {PlayerDecision.hit} over {PlayerDecision.stand}
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
