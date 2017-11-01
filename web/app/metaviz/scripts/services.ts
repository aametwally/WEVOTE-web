/**
 * Created by asem on 06/06/17.
 */
namespace metaviz {
    "use strict";
    export class HelloFactory {
        static readonly $inject = [HelloFactory.factory()];

        static factory() {
            let instance = () =>
                new HelloFactory();
            return instance;
        }

        public hello = () => {
            console.log("Hello, this is HelloFactory");
        }
    }

    export interface IPair {
        initial: number,
        final: number
    }

    export class TreemapColorSchemeFactory {

        private initialChroma = 10;
        private initialLuminance = 90;
        private chromaSlope = 70 / 9.0;
        private luminanceSlope = 40 / 9.0;

        private chroma = (level: number): number => {
            return this.initialChroma + this.chromaSlope * level;
        }

        private luminance = (level: number): number => {
            return this.initialLuminance - this.luminanceSlope * level;
        }

        static readonly $inject = [TreemapColorSchemeFactory.factory()];

        static factory() {
            let instance = () =>
                new TreemapColorSchemeFactory();
            return instance;
        }

        public colorizeTree = (tree: IAbundanceNode,
            range: IPair = { initial: 0, final: 360 },
            fraction: number = 0.7, perm: Boolean = true, rev: Boolean = true) => {
            console.log("Hello, TreemapColorSchemeFactory.colorizeTree()");
            this.assignHCL(tree, range, this.chroma(0),
                this.luminance(0), 0, fraction, perm, rev);
        }

        private assignHCL = (node: IAbundanceNode, range: IPair,
            chroma: number, luminance: number, level: number, fraction: number = 0.7, perm: Boolean = true,
            rev: Boolean = true) => {
            node.color = { H: 0, C: 0, L: 0 };
            node.color.H = (range.initial + range.final) / 2.0;
            node.color.C = chroma;
            node.color.L = luminance;
            if (node.children) {
                const childrenRanges = this.distributeColorRange(node, range, fraction, perm, rev);
                let idx = 0;
                const newChroma = this.chroma(level + 1);
                const newLuminance = this.luminance(level + 1);
                node.children.forEach((child: IAbundanceNode, key: string, map: Map<string, IAbundanceNode>) => {
                    this.assignHCL(child, childrenRanges[idx++],
                        newChroma, newLuminance, level + 1, fraction, perm, rev);
                })
            }
        }

        private distributeColorRange = (node: IAbundanceNode, range: IPair,
            fraction: number, perm: Boolean, rev: Boolean): Array<IPair> => {
            const children = node.children;
            const n = children.size;
            const step = (range.final - range.initial) / n;
            const margin = step * (1 - fraction) / 2;
            let ranges = new Array<IPair>();
            for (let i = 0; i < n; i++)
                ranges.push({
                    initial: range.initial + i * step + margin,
                    final: range.initial + (i + 1) * step - margin
                });
            if (perm) {
                const idxBool = new Array<Boolean>(n).fill(false);
                const permutedRanges = new Array<IPair>(n);
                for (let i = 0; i < n; i++) {
                    let index = (i * 2) % n;
                    while (idxBool[index])
                        index++;
                    idxBool[index] = true;
                    permutedRanges[index] = ranges[i];
                }
                ranges = permutedRanges;
            }
            if (rev)
                ranges.forEach((pair: IPair, index: number) => {
                    if (index % 2 === 0) {
                        const temp = pair.initial;
                        pair.initial = pair.final;
                        pair.final = temp;
                    }
                });
            return ranges;
        }
    }

    metavizApp
        .factory('HelloService', HelloFactory.$inject)
        .factory('TreemapColorSchemeService', TreemapColorSchemeFactory.$inject)
        ;
}