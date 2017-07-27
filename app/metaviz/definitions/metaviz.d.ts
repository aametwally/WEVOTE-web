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
