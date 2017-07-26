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

    export interface IDonutChartScope extends ng.IScope 
    {
        data: Array<number>;
    }

    export class DonutChartController {
        static readonly $inject: any = ['$scope', '$interval', DonutChartController];
        private _scope: IDonutChartScope;

        constructor(private $scope: ng.IScope, private $interval: ng.IIntervalService) {
            this._scope = <IDonutChartScope> $scope;
            this._scope.data = [1, 2, 3, 4];
            // Either use setInterval then invoke $apply, or just use $interval angular's service.
            $interval(() => {
                this._scope.data = d3.range(10).map(function (d) {
                    return Math.random();
                });
            }, 1000);
        }
    }

    metavizApp
        .controller('MainController', MainController.$inject)
        ;
}