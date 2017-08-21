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

    interface Pair {
        initial: number,
        final: number
    }

    export class TreemapColorSchemeFactory {
        static readonly $inject = [TreemapColorSchemeFactory.factory()];

        static factory() {
            let instance = () =>
                new TreemapColorSchemeFactory();
            return instance;
        }

        public colorizeTree = (tree: IAbundanceNode, range: Pair,
            fraction: number = 5, perm: Boolean = true, rev: Boolean = true ) => {
            console.log("Hello, TreemapColorSchemeFactory.colorizeTree()");
            this.assignHue( tree , range , fraction , perm , rev );
        }

        private assignHue = (node: IAbundanceNode, range: Pair,
            fraction: number = 5, perm: Boolean = true, rev: Boolean = true) => {
            node.color.H = (range.initial + range.final) / 2.0;
            const childrenRanges = this.distributeColorRange( node , range , fraction , perm , rev );
            let idx = 0 ;
            node.children.forEach(function (child: IAbundanceNode, key: string, map: Map<string, IAbundanceNode>) {
                this.assignHue( child , childrenRanges[idx++] , fraction , perm , rev );
            })
        }

        private assignChromaLuminance = ( node: IAbundanceNode , chroma: number = 70, 
        luminance: number = 60 , slope: number = 10 ,  level: number = 0 ) => {
            node.color.C = chroma; 
            node.color.L = luminance;
            const newChroma = chroma - slope * level; // Apply a saturation function. e.g tansh
            const newLuminance = luminance + slope * level; // Apply a saturation function. e.g tansh
            node.children.forEach( (child: IAbundanceNode,key:string ) => {
                this.assignChromaLuminance( child , newChroma , newLuminance , slope , level + 1 );
            });
        };

        private distributeColorRange = (node: IAbundanceNode, range: Pair,
            fraction: number, perm: Boolean, rev: Boolean): Array<Pair> => {
            const children = node.children;
            const n = children.size;
            const step = range.final - range.initial / n;
            const margin = step * (1 - fraction) / 2;
            let ranges = new Array<Pair>();
            for (let i = 0; i < n; i++)
                ranges.push({
                    initial: range.initial + i * step + margin,
                    final: range.initial + (i + 1) * step - margin
                });
            if( perm )
            {
                const idxArray = new Array<number>( n );
                const idxBool = new Array<Boolean>( n ).fill( false );
                for( let i = 0 ; i < n ; i ++ )
                {
                    let index = (i*2) % n ;
                    while( idxBool[index] )
                        index++;
                    idxBool[index] = true;
                    idxArray[ index ] = i;
                }
                ranges = d3.permute( ranges , idxArray );
            }
            if( rev )
                ranges.forEach( (pair: Pair , index: number) => {
                    if( index %2 === 0 )
                    {
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