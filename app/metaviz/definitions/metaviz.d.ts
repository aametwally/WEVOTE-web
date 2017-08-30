/// <reference types="angular" />
/// <reference types="angular-resource" />
declare namespace metaviz {
    let metavizApp: angular.IModule;
}
declare namespace metaviz {
    class MainController {
        static readonly $inject: any;
        private _scope;
        constructor($scope: ng.IScope);
    }
    interface IDonutChartData {
        description: string;
        array: Array<number>;
    }
    interface IDonutChartScope extends ng.IScope {
        data: IDonutChartData;
    }
    class DonutChartController {
        private $scope;
        private $interval;
        static readonly $inject: any;
        private _scope;
        constructor($scope: ng.IScope, $interval: ng.IIntervalService);
    }
    interface Algorithm {
        name: string;
        used: boolean;
    }
    interface IConfig {
        algorithms: Array<Algorithm>;
        minNumAgreed: Number;
        minScore: Number;
        penalty: Number;
    }
    interface IWevoteClassification {
        seqId: string;
        votes: Array<Number>;
        resolvedTaxon: Number;
        numToolsReported: Number;
        numToolsAgreed: Number;
        score: Number;
    }
    interface ITaxLine {
        taxon: number;
        superkingdom: string;
        phylum: string;
        class: string;
        order: string;
        family: string;
        genus: string;
        species: string;
    }
    interface ITaxonomyAbundance {
        taxon: number;
        count: number;
        taxline: ITaxLine;
    }
    interface ITaxonomyAbundanceProfile {
        taxa_abundance: Array<ITaxonomyAbundance>;
    }
    interface IResutlsStatistics {
        readsCount: number;
        nonAbsoluteAgreement: number;
    }
    interface IResults {
        wevoteClassification: Array<IWevoteClassification>;
        numToolsUsed: number;
        taxonomyAbundanceProfile: ITaxonomyAbundanceProfile;
        statistics: IResutlsStatistics;
    }
    interface IAlgorithmsVennSets {
        count: number;
        reads: Array<IWevoteClassification>;
    }
    interface IVennDiagramSet {
        sets: Array<string>;
        size: number;
        reads: Array<IWevoteClassification>;
        nodes: Array<string>;
    }
    interface IVennDiagramScope extends ng.IScope {
        results: IResults;
        config: IConfig;
        wevoteContribution: boolean;
        sets: Array<IVennDiagramSet>;
    }
    class VennDiagramController {
        static readonly $inject: any;
        private _scope;
        constructor(scope: ng.IScope);
        protected processResults: (wevoteClassification: IWevoteClassification[], config: IConfig, filter?: ((readClassification: IWevoteClassification) => Boolean) | undefined, showWevote?: Boolean) => number;
    }
    interface IHCLColor {
        H: number;
        C: number;
        L: number;
    }
    interface IAbundanceNode {
        name: string;
        size?: number;
        color?: IHCLColor;
        children: Map<string, IAbundanceNode>;
    }
    interface IAbundanceSunburstScope extends ng.IScope {
        results: IResults;
        config: IConfig;
        hierarchy: any;
    }
    class AbundanceSunburstController {
        static readonly $inject: any;
        private _scope;
        private _treeColoring;
        constructor(scope: ng.IScope, treeColoring: TreemapColorSchemeFactory);
        private processResults;
        private hierarchyAsObject(tree);
        private buildHierarchy;
    }
}
declare namespace metaviz {
    interface IHellloWorldDirectiveScope extends ng.IScope {
        name: string;
    }
    class HelloWorldDirective implements ng.IDirective {
        restrict: string;
        replace: boolean;
        static readonly directiveName: string;
        private static readonly _inject;
        link: (scope: IHellloWorldDirectiveScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => void;
        constructor();
        static factory(): ng.IDirectiveFactory;
    }
    class DonutChartDirective implements ng.IDirective {
        restrict: string;
        static readonly directiveName: string;
        private static readonly _inject;
        controller: any;
        scope: boolean;
        bindToController: {
            data: string;
        };
        private readonly _w;
        private readonly _h;
        private readonly _min;
        private readonly _colors;
        private readonly _pie;
        private readonly _arcgen;
        link: (scope: any, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: any) => void;
        constructor();
        static factory(): ng.IDirectiveFactory;
    }
    interface IVennDiagramDirectiveScope extends ng.IScope {
        results: IResults;
        config: IConfig;
        wevoteContribution: boolean;
        sets: Array<IVennDiagramSet>;
    }
    class AlgorithmsVennDiagramDirective implements ng.IDirective {
        restrict: string;
        replace: boolean;
        static readonly directiveName: string;
        private static readonly _inject;
        controller: any;
        scope: {
            wevoteContribution: string;
            results: string;
            config: string;
        };
        bindToController: {
            sets: string;
            results: string;
            wevoteContribution: string;
            config: string;
        };
        private readonly _w;
        private readonly _h;
        private readonly _min;
        link: (scope: IVennDiagramDirectiveScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: any) => void;
        constructor();
        static factory(): ng.IDirectiveFactory;
    }
    interface IAbundanceSunburstDirectiveScope extends ng.IScope {
        hierarchy: any;
        totalSize: number;
    }
    interface IAbundanceSubburstHTMLElement {
        main: any;
        sequence: any;
        chart: any;
        explanation: any;
        percentage: any;
        sidebar: any;
        togglelegend: any;
        legend: any;
        svg: any;
        trail: any;
        endlabel: any;
    }
    class AbundanceSunburstDirective implements ng.IDirective {
        restrict: string;
        replace: boolean;
        static readonly directiveName: string;
        private static readonly _inject;
        scope: {
            hierarchy: string;
        };
        readonly b: {
            w: number;
            h: number;
            s: number;
            t: number;
        };
        readonly maxVisibleTrailAncestry: number;
        readonly colors: {
            "home": string;
            "product": string;
            "search": string;
            "account": string;
            "other": string;
            "end": string;
        };
        private readonly _w;
        private readonly _h;
        private readonly _radius;
        link: (scope: IAbundanceSunburstDirectiveScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: any) => void;
        private mouseover(scope, vis);
        private mouseleave;
        private initializeBreadcrumbTrail;
        private breadcrumbPoints;
        updateBreadcrumbs: (nodeArray: any, percentageString: any, vis: IAbundanceSubburstHTMLElement) => void;
        private drawLegend;
        private toggleLegend;
        constructor();
        static factory(): ng.IDirectiveFactory;
    }
}
declare namespace metaviz {
    class ShortNumberFilter {
        static readonly $inject: any;
        static filter(): (num: any) => any;
    }
}
declare namespace metaviz {
    class HelloFactory {
        static readonly $inject: (() => HelloFactory)[];
        static factory(): () => HelloFactory;
        hello: () => void;
    }
    interface IPair {
        initial: number;
        final: number;
    }
    class TreemapColorSchemeFactory {
        private initialChroma;
        private initialLuminance;
        private chromaSlope;
        private luminanceSlope;
        private chroma;
        private luminance;
        static readonly $inject: (() => TreemapColorSchemeFactory)[];
        static factory(): () => TreemapColorSchemeFactory;
        colorizeTree: (tree: IAbundanceNode, range?: IPair, fraction?: number, perm?: Boolean, rev?: Boolean) => void;
        private assignHCL;
        private distributeColorRange;
    }
}
