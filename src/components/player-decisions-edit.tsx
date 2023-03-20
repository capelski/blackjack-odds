import React from 'react';
import { clearGroupOverrides, hasGroupOverrides, hasOverrides } from '../logic';
import { PlayerActionOverridesByDealerCard, PlayerFactsGroup } from '../types';

interface PlayerDecisionsEditProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    processing: boolean;
    selectedPlayerFactsGroup?: PlayerFactsGroup;
}

export const PlayerDecisionsEdit: React.FC<PlayerDecisionsEditProps> = (props) => {
    const clearEnabled = props.selectedPlayerFactsGroup
        ? hasGroupOverrides(props.actionOverrides, props.selectedPlayerFactsGroup)
        : hasOverrides(props.actionOverrides);

    return (
        <React.Fragment>
            {' '}
            <input
                checked={props.playerDecisionsEdit}
                disabled={props.processing}
                onChange={(event) => props.playerDecisionsEditSetter(event.target.checked)}
                type="checkbox"
            />
            Edit player decisions{' '}
            <button
                disabled={props.processing || !clearEnabled}
                onClick={() => {
                    const nextActionOverrides = props.selectedPlayerFactsGroup
                        ? clearGroupOverrides(props.actionOverrides, props.selectedPlayerFactsGroup)
                        : {};
                    props.actionOverridesSetter(nextActionOverrides);
                }}
                type="button"
            >
                Clear {props.selectedPlayerFactsGroup ? 'these' : 'all'} edits
            </button>
        </React.Fragment>
    );
};
