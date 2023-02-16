import React from 'react';
import { ScoreKey } from '../models';
import { PlayerSettings } from '../types';

interface PlayerDecisionsEditProps {
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
    selectedScore?: ScoreKey;
}

export const PlayerDecisionsEdit: React.FC<PlayerDecisionsEditProps> = (props) => {
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
                disabled={
                    props.processing ||
                    Object.keys(props.playerSettings.playerDecisionsOverrides).length === 0
                }
                onClick={() => {
                    const nextPlayerDecisionsOverrides = props.selectedScore
                        ? {
                              ...props.playerSettings.playerDecisionsOverrides,
                              [props.selectedScore]: {}
                          }
                        : {};
                    props.playerSettingsSetter({
                        ...props.playerSettings,
                        playerDecisionsOverrides: nextPlayerDecisionsOverrides
                    });
                }}
                type="button"
            >
                Clear {props.selectedScore ? 'this' : 'all'} edits
            </button>
        </React.Fragment>
    );
};
