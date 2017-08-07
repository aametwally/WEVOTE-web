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
        taxon: Number;
        root: Number;
        superkingdom: Number;
        kingdom: Number;
        phylum: Number;
        class: Number;
        order: Number;
        family: Number;
        genus: Number;
        species: Number;
    }
    interface ITaxonomyAbundance {
        taxon: Number;
        count: Number;
        taxline: ITaxLine;
    }
    interface IResults {
        wevoteClassification: Array<IWevoteClassification>;
        numToolsUsed: Number;
        taxonomyAbundanceProfile: Array<ITaxonomyAbundance>;
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
