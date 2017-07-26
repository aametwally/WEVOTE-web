/// <reference types="angular" />
/// <reference types="angular-resource" />
declare module metaviz {
    let metavizApp: angular.IModule;
}
declare module metaviz {
    class MainController {
        static readonly $inject: any;
        private _scope;
        constructor($scope: ng.IScope);
    }
}
declare module metaviz {
    class ShortNumberFilter {
        static readonly $inject: any;
        static filter(): (num: any) => any;
    }
}
declare module metaviz {
    class HelloFactory {
        static readonly $inject: (() => HelloFactory)[];
        static factory(): () => HelloFactory;
        hello: () => void;
    }
}
