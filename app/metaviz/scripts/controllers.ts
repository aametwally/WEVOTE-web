/**
 * Created by asem on 06/06/17.
 */
"use strict";
// import { metavizApp } from './app';

module metaviz {
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

    metavizApp
        .controller('MainController', MainController.$inject)
        ;
}