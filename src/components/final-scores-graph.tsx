import cytoscape from 'cytoscape';
import React, { useEffect, useRef } from 'react';
import { colors } from '../constants';
import { FinalScores, PlayerFact } from '../types';
import { getRoundedFloat } from './rounded-float';

export type CytoscapeTree = {
    nodes: { data: { id: string } }[];
    edges: { data: { source: string; target: string } }[];
};

export interface FinalScoresGraphProps {
    finalScores: FinalScores;
    handDisplayKey: string;
    playerFacts: PlayerFact[];
}

export const FinalScoresGraph: React.FC<FinalScoresGraphProps> = (props) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) {
            return;
        }

        const tree: CytoscapeTree = {
            nodes: Object.keys(props.finalScores)
                .concat(props.handDisplayKey)
                .map((handDisplayKey) => {
                    const playerFact = props.playerFacts.find(
                        (x) => x.hand.displayKey === handDisplayKey
                    );
                    const isBustScore = playerFact && playerFact.hand.isBust;
                    return {
                        data: {
                            id: handDisplayKey,
                            nodeColor: isBustScore
                                ? colors.loss.backgroundColor
                                : colors.payout.backgroundColor
                        }
                    };
                }),
            edges: Object.keys(props.finalScores).map((handDisplayKey: string) => {
                const playerFact = props.playerFacts.find(
                    (x) => x.hand.displayKey === handDisplayKey
                );
                const isBustScore = playerFact && playerFact.hand.isBust;

                return {
                    data: {
                        edgeColor: isBustScore
                            ? colors.loss.backgroundColor
                            : colors.payout.backgroundColor,
                        source: props.handDisplayKey,
                        target: handDisplayKey,
                        label: getRoundedFloat(props.finalScores[handDisplayKey].weight)
                    }
                };
            })
        };

        cytoscape({
            container: container.current,
            layout: {
                name: 'concentric',
                transform(_node, position) {
                    return { x: position.x * 2, y: position.y * 2 };
                }
            },
            userZoomingEnabled: false,
            userPanningEnabled: false,
            style: [
                {
                    selector: 'node',
                    style: {
                        content: 'data(id)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': 'white',
                        color: 'data(nodeColor)',
                        'border-color': 'data(nodeColor)',
                        'border-width': 1,
                        'font-size': 16
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'curve-style': 'bezier',
                        width: 1,
                        'target-arrow-shape': 'triangle',
                        'line-color': 'data(edgeColor)',
                        'target-arrow-color': 'data(edgeColor)',
                        label: 'data(label)'
                    }
                },
                {
                    selector: 'edge[label]',
                    style: {
                        color: 'data(edgeColor)',
                        'text-background-opacity': 1,
                        'text-background-color': 'white',
                        'font-size': 14
                    }
                }
            ],
            elements: tree
        });
    }, [container, props.finalScores, props.handDisplayKey, props.playerFacts]);

    return (
        <div
            ref={container}
            style={{
                border: '1px solid black',
                height: 'min(80vh, 80vw)',
                width: 'min(80vh, 80vw)'
            }}
        ></div>
    );
};
