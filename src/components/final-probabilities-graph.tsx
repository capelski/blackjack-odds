import cytoscape from 'cytoscape';
import React, { useEffect, useRef } from 'react';
import { colors } from '../constants';
import { ScoreKey } from '../models';
import { FinalScoreProbabilities, ScoreStats } from '../types';
import { getRoundedFloat } from './rounded-float';

export type CytoscapeTree = {
    nodes: { data: { id: string } }[];
    edges: { data: { source: string; target: string } }[];
};

export interface FinalProbabilitiesGraphProps {
    allScoreStats: ScoreStats[];
    finalProbabilities: FinalScoreProbabilities;
    scoreKey: ScoreKey;
}

export const FinalProbabilitiesGraph: React.FC<FinalProbabilitiesGraphProps> = (props) => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) {
            return;
        }

        const tree: CytoscapeTree = {
            nodes: Object.keys(props.finalProbabilities)
                .concat(props.scoreKey)
                .map((scoreKey) => {
                    const validScore = props.allScoreStats!.find((x) => x.key === scoreKey);
                    return {
                        data: {
                            id: scoreKey,
                            nodeColor: validScore
                                ? colors.payout.backgroundColor
                                : colors.loss.backgroundColor
                        }
                    };
                }),
            edges: Object.keys(props.finalProbabilities).map((target: ScoreKey) => {
                const validScore = props.allScoreStats!.find((x) => x.key === target);
                return {
                    data: {
                        edgeColor: !validScore
                            ? colors.loss.backgroundColor
                            : colors.payout.backgroundColor,
                        source: props.scoreKey,
                        target,
                        label: getRoundedFloat(props.finalProbabilities[target as any])
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
    }, [container, props.allScoreStats, props.finalProbabilities]);

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
