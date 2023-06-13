import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { colors, desktopBreakpoint, labels } from '../constants';
import { Action } from '../models';
import {
    DealerFact,
    DealerFacts,
    GroupedPlayerFacts,
    PlayerActionData,
    PlayerActionOverridesByDealerCard,
    RepresentativeHand
} from '../types';
import { FinalScoresGraph } from './final-scores-graph';
import { NextHandsTable } from './next-hands-table';
import { OutcomeBadge } from './outcome-badge';

interface ActionDetailsProps {
    actionData: PlayerActionData;
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    dealerFact?: DealerFact;
    dealerFacts?: DealerFacts;
    expand: () => void;
    hand: RepresentativeHand;
    isExpanded: boolean;
    playerFacts: GroupedPlayerFacts;
    playerGroupCode: string;
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    processing: boolean;
}

export const ActionDetails: React.FC<ActionDetailsProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    return (
        <div>
            <h4 onClick={props.expand}>
                {props.isExpanded ? '⬇️' : '➡️'} {props.actionData.action}
                <hr />
            </h4>

            {props.isExpanded && (
                <React.Fragment>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isDesktop ? 'repeat(9, 1fr)' : 'repeat(3, 1fr)'
                        }}
                    >
                        <OutcomeBadge
                            {...colors.win}
                            name={labels.win}
                            value={props.actionData.vsDealerOutcome.winProbability || 0}
                        />
                        <OutcomeBadge
                            {...colors.win}
                            name={labels.dealerBusting}
                            style="outline"
                            value={props.actionData.vsDealerBreakdown.dealerBusting || 0}
                        />
                        <OutcomeBadge
                            {...colors.win}
                            name={labels.playerMoreThanDealer}
                            style="outline"
                            value={props.actionData.vsDealerBreakdown.playerMoreThanDealer || 0}
                        />

                        <OutcomeBadge
                            {...colors.loss}
                            name={labels.loss}
                            value={props.actionData.vsDealerOutcome.lossProbability || 0}
                        />
                        <OutcomeBadge
                            {...colors.loss}
                            name={labels.playerBusting}
                            style="outline"
                            value={props.actionData.vsDealerBreakdown.playerBusting || 0}
                        />
                        <OutcomeBadge
                            {...colors.loss}
                            name={labels.playerLessThanDealer}
                            style="outline"
                            value={props.actionData.vsDealerBreakdown.playerLessThanDealer || 0}
                        />

                        <OutcomeBadge
                            {...colors.push}
                            name={labels.push}
                            value={props.actionData.vsDealerOutcome.pushProbability || 0}
                        />

                        <OutcomeBadge
                            {...colors.advantage}
                            name={labels.advantage}
                            value={props.actionData.vsDealerOutcome.playerAdvantage.hands || 0}
                        />
                        <OutcomeBadge
                            {...colors.payout}
                            name={labels.payout}
                            value={props.actionData.vsDealerOutcome.playerAdvantage.payout || 0}
                        />
                    </div>

                    <br />

                    {props.actionData.action !== Action.stand && (
                        <FinalScoresGraph
                            finalScores={props.actionData.finalScores}
                            handDisplayKey={props.playerGroupCode}
                            playerFacts={props.playerFacts}
                        />
                    )}

                    <br />

                    {props.actionData.action === Action.hit && props.dealerFacts && (
                        <NextHandsTable
                            {...props}
                            data={props.hand.nextHands}
                            dealerFact={props.dealerFact}
                            dealerFacts={props.dealerFacts}
                            direction="vertical"
                            playerFacts={props.playerFacts}
                        />
                    )}
                    {props.actionData.action === Action.split && props.dealerFacts && (
                        <NextHandsTable
                            {...props}
                            data={props.hand.splitNextHands}
                            dealerFact={props.dealerFact}
                            dealerFacts={props.dealerFacts}
                            direction="vertical"
                            playerFacts={props.playerFacts}
                        />
                    )}
                </React.Fragment>
            )}
        </div>
    );
};
