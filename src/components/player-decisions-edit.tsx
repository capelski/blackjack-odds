import React from 'react';
import { PlayerActionOverrides, PlayerActionOverridesByDealerCard } from '../types';

interface PlayerDecisionsEditProps {
    actionOverrides: PlayerActionOverridesByDealerCard;
    actionOverridesSetter: (actionOverrides: PlayerActionOverridesByDealerCard) => void;
    playerDecisionsEdit: boolean;
    playerDecisionsEditSetter: (playerDecisionsEdit: boolean) => void;
    processing: boolean;
    handKey?: string;
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
                disabled={props.processing || Object.keys(props.actionOverrides).length === 0}
                onClick={() => {
                    const nextPlayerActionsOverrides = props.handKey
                        ? Object.keys(
                              props.actionOverrides
                          ).reduce<PlayerActionOverridesByDealerCard>((reduced, next) => {
                              return {
                                  ...reduced,
                                  [next]: {
                                      ...Object.keys(props.actionOverrides[next])
                                          .filter((key) => key !== props.handKey)
                                          .reduce<PlayerActionOverrides>(
                                              (innerReduce, innerNext) => {
                                                  return {
                                                      ...innerReduce,
                                                      [innerNext]:
                                                          props.actionOverrides[next][innerNext]
                                                  };
                                              },
                                              {}
                                          )
                                  }
                              };
                          }, {})
                        : {};
                    props.actionOverridesSetter(nextPlayerActionsOverrides);
                }}
                type="button"
            >
                Clear {props.handKey ? 'this' : 'all'} edits
            </button>
        </React.Fragment>
    );
};
