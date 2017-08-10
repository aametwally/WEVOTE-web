/**
 * Created by asem on 06/06/17.
 */
"use strict";
namespace metaviz {
    interface MainControllerScope extends ng.IScope {
        message: String,
    }
    export class MainController {
        static readonly $inject: any = ['$scope', MainController];
        private _scope: MainControllerScope;

        constructor($scope: ng.IScope) {
            this._scope = <MainControllerScope>$scope;
            this._scope.message = "Hello, this is metaviz ...";
            console.log(this._scope.message);
        }

    }

    export interface IDonutChartData {
        description: string,
        array: Array<number>
    }
    export interface IDonutChartScope extends ng.IScope {
        data: IDonutChartData
    }

    export class DonutChartController {
        static readonly $inject: any = ['$scope', '$interval', DonutChartController];
        private _scope: IDonutChartScope;

        constructor(private $scope: ng.IScope, private $interval: ng.IIntervalService) {
            this._scope = <IDonutChartScope>$scope;
            this._scope.data = {
                array: [1, 2, 3, 4],
                description: "some description"
            };
            // Either use setInterval then invoke $apply, or just use $interval angular's service.
            $interval(() => {
                this._scope.data.array = d3.range(10).map(function (d) {
                    return Math.random();
                });
            }, 1000);
        }
    }

    export interface Algorithm {
        name: string;
        used: boolean;
    }

    export interface IConfig {
        algorithms: Array<Algorithm>;
        minNumAgreed: Number;
        minScore: Number;
        penalty: Number;
    }

    export interface IWevoteClassification {
        seqId: string,
        taxa: Array<Number>,
        resolvedTaxon: Number,
        numToolsReported: Number,
        numToolsAgreed: Number,
        score: Number,
    }

    // Note: Root and Kingdom are not included.
    export interface ITaxLine {
        taxon: number;
        superkingdom: string;
        phylum: string;
        class: string;
        order: string;
        family: string;
        genus: string;
        species: string;
    }

    export interface ITaxonomyAbundance {
        taxon: number;
        count: number;
        taxline: ITaxLine;
    }

    export interface ITaxonomyAbundanceProfile {
        taxa_abundance: Array<ITaxonomyAbundance>
    }

    export interface IResults {
        wevoteClassification: Array<IWevoteClassification>,
        numToolsUsed: number,
        taxonomyAbundanceProfile: ITaxonomyAbundanceProfile
    }

    export interface IAlgorithmsVennSets {
        count: number, // size
        reads: Array<IWevoteClassification> //seqId
    }

    export interface IVennDiagramSet {
        sets: Array<string>,
        size: number,
        reads: Array<IWevoteClassification>,
        nodes: Array<string>
    }

    export interface IVennDiagramScope extends ng.IScope {
        results: IResults,
        config: IConfig,
        sets: Array<IVennDiagramSet>
    }

    export class VennDiagramController {
        static readonly $inject: any = ['$scope', VennDiagramController];
        private _scope: IVennDiagramScope;

        constructor(scope: ng.IScope) {
            this._scope = <IVennDiagramScope>scope;
            this._scope.$watch('results', (results: IResults) => {
                if (results && this._scope.config) {
                    console.log("processing results..");
                    this.processResults(results, this._scope.config);
                }
                else
                    console.log("results is not yet defined.");
            });
        };

        private processResults = (results: IResults, config: IConfig) => {
            const wevoteClassification = results.wevoteClassification;
            const algorithms = config.algorithms;
            if (algorithms.length != wevoteClassification[0].taxa.length) {
                console.warn("Results inconsistency", algorithms, wevoteClassification[0].taxa);
                return;
            }

            let _sets: Map<string, IAlgorithmsVennSets> = <any>new Map<string, IAlgorithmsVennSets>();
            // Prepare data to be passed to d3.js venn diagram.
            wevoteClassification.forEach(function (readClassification: IWevoteClassification, readIndex: number) {
                // counterMap< targeted taxid , algorithms agreed >
                let counterMap: Map<number, Set<Array<number>>> = <any>new Map<number, Array<number>>();

                readClassification.taxa.forEach(function (taxid: number, algIdx: number) {
                    let set = counterMap.get(taxid);
                    if (set) {
                        let combinations: Set<Array<number>> = new Set<Array<number>>();
                        set.forEach((arr: Array<number>) => {
                            combinations.add(arr.concat(algIdx));
                        });
                        combinations.forEach((arr: Array<number>) => {
                            if (set) set.add(arr);
                        });
                        set.add([algIdx]);
                    }
                    else {
                        let newSet = new Set<Array<number>>();
                        newSet.add([algIdx]);
                        counterMap.set(taxid, newSet);
                    }
                });

                counterMap.forEach(function (agreedAlgorithmsIdxSets: Set<number[]>, taxid: number) {
                    agreedAlgorithmsIdxSets.forEach(function (agreedAlgorithmsIdx: number[]) {
                        const algsStr = agreedAlgorithmsIdx.join(',');
                        let set = _sets.get(algsStr);
                        if (set) {
                            set.count++;
                            set.reads.push(readClassification);
                        }
                        else
                            _sets.set(algsStr, {
                                count: 1,
                                reads: [readClassification]
                            });
                    });
                });
            });

            let sets: Array<any> = [];
            _sets.forEach(function (vennBucket: IAlgorithmsVennSets, algorithmsSet: string) {
                sets.push(
                    {
                        sets: algorithmsSet.split(',').map(function (algIdx: string) {
                            return algorithms[parseInt(algIdx)].name;
                        }),
                        size: vennBucket.count,
                        reads: vennBucket.reads,
                        nodes: vennBucket.reads.map(function (wevoteItem: IWevoteClassification) {
                            return wevoteItem.seqId;
                        })
                    });
            });

            this._scope.sets = sets;
        }

    }

    export interface IAbundanceNode {
        name: string,
        size?: number,
        children: Map<string, IAbundanceNode>
    }

    export interface IAbundanceSunburstScope extends ng.IScope {
        results: IResults,
        config: IConfig,
        hierarchy: any
    }

    export class AbundanceSunburstController {
        static readonly $inject: any = ['$scope', AbundanceSunburstController];
        private _scope: IAbundanceSunburstScope;

        constructor(scope: ng.IScope) {
            this._scope = <IAbundanceSunburstScope>scope;
            this._scope.$watch('results', (results: IResults) => {
                if (results && this._scope.config) {
                    console.log("processing results..");
                    this.processResults(results, this._scope.config);
                }
                else
                    console.log("results is not yet defined.");
            });
        };

        private processResults = (results: IResults, config: IConfig) => {
            const tree = this.buildHierarchy(results.taxonomyAbundanceProfile.taxa_abundance);

            this._scope.hierarchy = this.hierarchyAsObject(tree);
        };

        private hierarchyAsObject(tree: IAbundanceNode) {
            const obj = Object.create(null);
            if (tree.name) obj.name = tree.name;
            if (tree.size) obj.size = tree.size;
            if (tree.children) {
                const childrenArray: Array<IAbundanceNode> = Array.from(tree.children.values());
                obj.children = new Array<IAbundanceNode>();                
                childrenArray.forEach((node: IAbundanceNode) => {
                    // We don’t escape the key '__proto__'
                    // which can cause problems on older engines
                    obj.children.push( this.hierarchyAsObject(node) );
                });
            }
            return obj;
        }

        private buildHierarchy = (taxonomyAbundanceProfile: Array<ITaxonomyAbundance>): IAbundanceNode => {

            const tree: IAbundanceNode = {
                name: "Abundance Tree",
                children: new Map<string, IAbundanceNode>()
            }
            for (let taxonomyAbundance of taxonomyAbundanceProfile) {
                if (!taxonomyAbundance.taxline.superkingdom) continue;

                let currentNode = tree;

                const taxlineArray = [
                    taxonomyAbundance.taxline.superkingdom,
                    taxonomyAbundance.taxline.phylum,
                    taxonomyAbundance.taxline.class,
                    taxonomyAbundance.taxline.order,
                    taxonomyAbundance.taxline.family,
                    taxonomyAbundance.taxline.genus,
                    taxonomyAbundance.taxline.species
                ];

                for (const level of taxlineArray) {
                    if (!level) break;
                    const successor = currentNode.children.get(level);
                    if (successor) currentNode = successor;
                    else {
                        const newSuccessor: IAbundanceNode = {
                            name: level,
                            children: new Map<string, IAbundanceNode>()
                        };

                        currentNode.children.set(level, newSuccessor);
                        currentNode = newSuccessor;
                    }
                }
                currentNode.size = taxonomyAbundance.count;
            }
            return tree;
        }
    }

   

    metavizApp
        .controller('MainController', MainController.$inject)
        .controller('DonutChartController', DonutChartController.$inject)
        .controller('VennDiagramController', VennDiagramController.$inject)
        .controller('AbundanceSunburstController', AbundanceSunburstController.$inject)
        ;
}