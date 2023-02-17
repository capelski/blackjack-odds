import React, { useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { colors, desktopBreakpoint } from '../constants';
import { getOutcomesSet } from '../logic';
import { ScoreKey } from '../models';
import { AllScoreStatsChoicesSummary, PlayerSettings, ScoreStats } from '../types';
import { CustomColumn, CustomTableDirection, CustomTable } from './custom-table';
import { PlayerDecisionsEdit } from './player-decisions-edit';
import { PlayerDecisionsTableCell } from './player-decisions-table-cell';
import { RoundedFloat } from './rounded-float';

export type ScoreStatsColumn = CustomColumn<
    ScoreStats,
    {
        dealerCardKey?: ScoreKey;
    }
>;

interface PlayerDecisionsTableProps {
    additionalColumns?: ScoreStatsColumn[];
    data: ScoreStats[];
    direction?: CustomTableDirection;
    playerChoices: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
    selectedScore?: ScoreKey;
}

export const PlayerDecisionsTable: React.FC<PlayerDecisionsTableProps> = (props) => {
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const columns = useMemo(() => {
        const outcomesSet = getOutcomesSet();
        const abbreviate = !isDesktop && props.direction !== 'vertical';
        const columns: ScoreStatsColumn[] = [
            ...(props.additionalColumns || []),
            ...outcomesSet.allOutcomes.map<ScoreStatsColumn>((dealerCard) => ({
                Cell: PlayerDecisionsTableCell({
                    abbreviate,
                    dealerCard,
                    playerChoices: props.playerChoices,
                    playerDecisionsEdit,
                    playerSettings: props.playerSettings,
                    playerSettingsSetter: props.playerSettingsSetter,
                    processing: props.processing
                }),
                Header: () => {
                    return (
                        <React.Fragment>
                            {dealerCard.symbol}
                            {!abbreviate && (
                                <span
                                    style={{
                                        fontSize: 12,
                                        fontStyle: 'italic',
                                        fontWeight: 'normal'
                                    }}
                                >
                                    {' '}
                                    (
                                    <RoundedFloat value={outcomesSet.allWeights[dealerCard.key]} />)
                                </span>
                            )}
                        </React.Fragment>
                    );
                },
                id: dealerCard.key,
                dealerCardKey: dealerCard.key
            }))
        ];
        return columns;
    }, [isDesktop, playerDecisionsEdit, props.additionalColumns]);

    return (
        <React.Fragment>
            <CustomTable
                cellStyle={(cellProps) => {
                    const { dealerCardKey } = cellProps.column;
                    const { key: scoreKey } = cellProps.row.original;

                    const choiceIsOverride =
                        dealerCardKey &&
                        props.playerChoices.choices[scoreKey].dealerCardChoices[dealerCardKey]
                            .choiceIsOverride;
                    const playerOverride =
                        dealerCardKey &&
                        props.playerSettings.playerDecisionsOverrides[scoreKey]?.[dealerCardKey];

                    const hasPlayerOverride = choiceIsOverride && playerOverride !== undefined;

                    return {
                        borderColor: hasPlayerOverride
                            ? colors.border.highlight
                            : colors.border.regular,
                        opacity: hasPlayerOverride ? 0.7 : undefined
                    };
                }}
                columns={columns}
                data={props.data}
                direction={props.direction}
                width="100%"
            />
            <br />
            <PlayerDecisionsEdit
                playerDecisionsEdit={playerDecisionsEdit}
                playerDecisionsEditSetter={setPlayerDecisionsEdit}
                playerSettings={props.playerSettings}
                playerSettingsSetter={props.playerSettingsSetter}
                processing={props.processing}
                selectedScore={props.selectedScore}
            />
            <br />
            <br />
        </React.Fragment>
    );
};
