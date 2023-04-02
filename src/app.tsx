import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
    getAllRepresentativeHands,
    getDealerFacts,
    getDefaultCasinoRues,
    getDefaultPlayerStrategy,
    getPlayerAverageData,
    getPlayerFacts,
    groupPlayerFacts
} from './logic';
import { Paths } from './models';
import {
    DealerFacts,
    GroupedPlayerFacts,
    PlayerActionOverridesByDealerCard,
    PlayerAverageData
} from './types';
import {
    NavBar,
    PlayerDecisionsAll,
    PlayerDecisionsDealerCard,
    PlayerDecisionsScore,
    StrategyAndRules
} from './views';

export const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export const App: React.FC = () => {
    const [actionOverrides, setActionOverrides] = useState<PlayerActionOverridesByDealerCard>({});
    const [casinoRules, setCasinoRules] = useState(getDefaultCasinoRues());
    const [processing, setProcessing] = useState(true);
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);
    const [playerStrategy, setPlayerStrategy] = useState(getDefaultPlayerStrategy());

    const [dealerFacts, setDealerFacts] = useState<DealerFacts>();
    const [playerAverageData, setPlayerAverageData] = useState<PlayerAverageData>();
    const [playerFacts, setPlayerFacts] = useState<GroupedPlayerFacts>();

    // A change in settings disables further changes in settings until re-processing data
    // (could be done with a setTimeout, but safer to trigger an additional render cycle)
    useEffect(() => {
        setProcessing(true);
    }, [actionOverrides, casinoRules, playerStrategy]);

    // allScoreStats and playerChoices must be recomputed upon settings change
    useEffect(() => {
        if (processing) {
            const representativeHands = getAllRepresentativeHands(casinoRules);
            // console.log('Representative hands', representativeHands);

            const dealerFacts = getDealerFacts(representativeHands);
            // console.log('Dealer facts', dealerFacts);

            const allPlayerFacts = getPlayerFacts(
                representativeHands,
                dealerFacts,
                casinoRules,
                playerStrategy,
                actionOverrides
            );
            // console.log('All player facts', allPlayerFacts);

            const playerAverageData = getPlayerAverageData(allPlayerFacts);
            // console.log('Player average data', playerAverageData);

            const groupedPlayerFacts = groupPlayerFacts(allPlayerFacts);
            // console.log('Grouped player facts', groupedPlayerFacts);

            setDealerFacts(dealerFacts);
            setPlayerAverageData(playerAverageData);
            setPlayerFacts(groupedPlayerFacts);
            setProcessing(false);
        }
    }, [processing]);

    return (
        <div>
            <BrowserRouter basename="/blackjack-odds">
                <ScrollToTop />
                <NavBar />
                <Routes>
                    <Route
                        path={Paths.playerDecisions}
                        element={
                            <PlayerDecisionsAll
                                actionOverrides={actionOverrides}
                                actionOverridesSetter={setActionOverrides}
                                playerBaseData={playerAverageData?.vsDealerCards}
                                playerDecisionsEdit={playerDecisionsEdit}
                                playerDecisionsEditSetter={setPlayerDecisionsEdit}
                                playerFacts={playerFacts}
                                dealerFacts={dealerFacts}
                                processing={processing}
                            />
                        }
                    />
                    <Route
                        path={Paths.playerDecisionsDealerCard}
                        element={
                            <PlayerDecisionsDealerCard
                                actionOverrides={actionOverrides}
                                actionOverridesSetter={setActionOverrides}
                                dealerFacts={dealerFacts}
                                playerDecisionsEdit={playerDecisionsEdit}
                                playerDecisionsEditSetter={setPlayerDecisionsEdit}
                                playerFacts={playerFacts}
                                processing={processing}
                            />
                        }
                    />
                    <Route
                        path={Paths.playerDecisionsScore}
                        element={
                            <PlayerDecisionsScore
                                actionOverrides={actionOverrides}
                                actionOverridesSetter={setActionOverrides}
                                dealerFacts={dealerFacts}
                                playerDecisionsEdit={playerDecisionsEdit}
                                playerDecisionsEditSetter={setPlayerDecisionsEdit}
                                playerFacts={playerFacts}
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
                                playerBaseData={playerAverageData?.vsDealerCards}
                                playerStrategy={playerStrategy}
                                playerStrategySetter={setPlayerStrategy}
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
