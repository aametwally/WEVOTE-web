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
        taxa: Array<Number>;
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
    interface IResults {
        wevoteClassification: Array<IWevoteClassification>;
        numToolsUsed: number;
        taxonomyAbundanceProfile: ITaxonomyAbundanceProfile;
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
        sets: Array<IVennDiagramSet>;
    }
    class VennDiagramController {
        static readonly $inject: any;
        private _scope;
        constructor(scope: ng.IScope);
        private processResults;
    }
    interface IAbundanceNode {
        name: string;
        size?: number;
        children: Map<string, IAbundanceNode>;
    }
    interface IAbundanceSubburstScope extends ng.IScope {
        results: IResults;
        config: IConfig;
        hierarchy: any;
    }
    class AbundanceSubburstController {
        static readonly $inject: any;
        private _scope;
        constructor(scope: ng.IScope);
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
        replace: boolean;
        static readonly directiveName: string;
        private static readonly _inject;
        scope: {
            data: string;
        };
        private readonly _w;
        private readonly _h;
        private readonly _min;
        private readonly _colors;
        private readonly _pie;
        private readonly _arcgen;
        link: (scope: angular.IScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: any) => void;
        constructor();
        static factory(): ng.IDirectiveFactory;
    }
    interface IVennDiagramDirectiveScope extends ng.IScope {
        sets: Array<IAlgorithmsVennSets>;
    }
    class AlgorithmsVennDiagramDirective implements ng.IDirective {
        restrict: string;
        replace: boolean;
        static readonly directiveName: string;
        private static readonly _inject;
        scope: {
            sets: string;
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
        vis: any;
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
        private mouseover;
        private mouseleave;
        private initializeBreadcrumbTrail;
        breadcrumbPoints: (d: any, i: any) => string;
        updateBreadcrumbs: (nodeArray: any, percentageString: any, all: IAbundanceSubburstHTMLElement) => void;
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
}
