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
    interface IDonutChartScope extends ng.IScope {
        data: Array<number>;
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
