/// <reference types="angular" />
/// <reference types="angular-resource" />
declare namespace metaviz {
    let metavizApp: angular.IModule;
}
declare namespace common {
    interface ITaxLine {
        taxon: number;
        root: string;
        superkingdom: string;
        kingdom: string;
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
        experiment: any;
        abundance: ITaxonomyAbundance[];
    }
    interface IUser {
        username: string;
        password: string;
        email: string;
        admin: boolean;
        createdAt: Date;
        modifiedAt: Date;
    }
    interface IRemoteAddress {
        host: string;
        port: number;
        relativePath: string;
    }
    enum EStatus {
        NOT_STARTED,
        IN_PROGRESS,
        SUCCSESS,
        FAILURE,
    }
    interface IStatus {
        code: EStatus;
        message: string;
        percentage: number;
    }
    interface IWevoteSubmitEnsemble {
        jobID: string;
        resultsRoute: IRemoteAddress;
        reads: IWevoteClassification[];
        status: IStatus;
        score: number;
        penalty: number;
        minNumAgreed: number;
        distances: number[];
    }
    interface IWevoteClassification {
        seqId: string;
        votes: number[];
        resolvedTaxon?: number;
        numToolsReported?: number;
        numToolsAgreed?: number;
        numToolsUsed?: number;
        score?: number;
        distances?: number[];
        cost?: number;
    }
    interface IWevoteClassificationPatch {
        experiment: any;
        patch: IWevoteClassification[];
        distances: number[];
        status: IStatus;
    }
    interface IAlgorithm {
        name: string;
        used: boolean;
    }
    interface IConfig {
        algorithms: IAlgorithm[];
        minNumAgreed: number;
        minScore: number;
        penalty: number;
    }
    interface IResults {
        wevoteClassification: any;
        taxonomyAbundanceProfile: any;
    }
    interface IUsageScenario {
        value: string;
        usage: string;
        hint?: string;
    }
    interface IRemoteFile {
        name: string;
        description: string;
        onServer?: Boolean;
        uri: string;
        data: string;
        size: number;
        tag?: string;
        count?: number;
    }
    interface IExperiment {
        user: any;
        isPrivate: boolean;
        email: string;
        description: string;
        reads: IRemoteFile;
        taxonomy: IRemoteFile;
        ensemble: IRemoteFile;
        config: IConfig;
        status?: IStatus;
        results?: IResults;
        usageScenario: IUsageScenario;
        createdAt?: Date;
        modifiedAt?: Date;
    }
}
declare namespace metaviz {
    interface IDonutChartData {
        description: string;
        array: Array<number>;
    }
    interface IWevoteResutlsStatistics {
        readsCount: number;
        nonAbsoluteAgreement: number;
    }
    interface IResults {
        wevoteClassification: common.IWevoteClassification[];
        abundance: common.ITaxonomyAbundance[];
        numToolsUsed: number;
        statistics: IWevoteResutlsStatistics;
    }
    interface IAlgorithmsVennSets {
        count: number;
        reads: Array<common.IWevoteClassification>;
    }
    interface IVennDiagramSet {
        sets: Array<string>;
        size: number;
        reads: Array<common.IWevoteClassification>;
        nodes: Array<string>;
    }
    interface IHCLColor {
        H: number;
        C: number;
        L: number;
    }
    interface IAbundanceNode {
        name: string;
        taxon: number;
        size?: number;
        color?: IHCLColor;
        children: Map<string, IAbundanceNode>;
    }
    class MainController {
        static readonly $inject: any;
        private _scope;
        constructor($scope: ng.IScope);
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
    interface IVennDiagramScope extends ng.IScope {
        results: IResults;
        config: common.IConfig;
        wevoteContribution: boolean;
        sets: Array<IVennDiagramSet>;
    }
    class VennDiagramController {
        static readonly $inject: any;
        private _scope;
        constructor(scope: ng.IScope);
        protected processResults: (wevoteClassification: common.IWevoteClassification[], config: common.IConfig, filter?: (readClassification: common.IWevoteClassification) => Boolean, showWevote?: Boolean) => number;
    }
    interface IAbundanceSunburstScope extends ng.IScope {
        results: IResults;
        config: common.IConfig;
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
    type WevoteTableHeaderFunction = (config: common.IConfig) => string[];
    const wevoteTableHeader: WevoteTableHeaderFunction;
    const abundanceTableHeader: string[];
    interface IWevoteTableEntry extends common.IWevoteClassification {
    }
    interface IAbundanceTableEntry extends common.ITaxonomyAbundance {
    }
    interface ITableScope<E> extends ng.IScope {
        results: IResults;
        config: common.IConfig;
        header: string[];
        entries: E[];
    }
    class WevoteTableController {
        static readonly $inject: any;
        private _scope;
        constructor(scope: ITableScope<IWevoteTableEntry>);
        protected processResults: (wevoteClassification: common.IWevoteClassification[], config: common.IConfig) => void;
    }
    class AbundanceTableController {
        static readonly $inject: any;
        private _scope;
        constructor(scope: ITableScope<IAbundanceTableEntry>);
        protected processResults: (abundance: common.ITaxonomyAbundance[], config: common.IConfig) => void;
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
        link: ng.IDirectiveLinkFn;
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
        results: common.IResults;
        config: common.IConfig;
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
        private readonly _w;
        private readonly _h;
        private readonly _radius;
        private taxonNCBIPageService;
        link: (scope: IAbundanceSunburstDirectiveScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: any) => void;
        private mouseover(scope, vis);
        private mouseleave;
        private initializeBreadcrumbTrail;
        private breadcrumbPoints;
        updateBreadcrumbs: (nodeArray: any, percentageString: any, vis: IAbundanceSubburstHTMLElement) => void;
        constructor(taxonNCBIPageService: any);
        static factory(): ng.IDirectiveFactory;
    }
    class WevoteTableDirective implements ng.IDirective {
        restrict: string;
        replace: boolean;
        static readonly directiveName: string;
        private static readonly _inject;
        private taxonNCBIPageService;
        controller: any;
        scope: {
            results: string;
            config: string;
        };
        bindToController: {
            results: string;
            config: string;
            header: string;
            entries: string;
        };
        readonly heatmapMaxEntries: number;
        private downloadWevolteClassification;
        link: (scope: ITableScope<IWevoteTableEntry>, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: any) => void;
        constructor(taxonNCBIPageService: any);
        static factory(): ng.IDirectiveFactory;
    }
    class AbundanceTableDirective implements ng.IDirective {
        restrict: string;
        replace: boolean;
        static readonly directiveName: string;
        private static readonly _inject;
        private taxonNCBIPageService;
        controller: any;
        scope: {
            results: string;
            config: string;
        };
        bindToController: {
            results: string;
            config: string;
            header: string;
            entries: string;
        };
        readonly heatmapMaxEntries: number;
        private downloadAbundance;
        link: (scope: ITableScope<IAbundanceTableEntry>, element: angular.IAugmentedJQuery, attrs: angular.IAttributes, ngModel: any) => void;
        constructor(taxonNCBIPageService: any);
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
    class NCBITaxonPageFactory {
        static readonly $inject: (() => NCBITaxonPageFactory)[];
        static factory(): () => NCBITaxonPageFactory;
        openTaxonPage: (taxid: number) => void;
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
