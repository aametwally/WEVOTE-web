"use strict";
var metaviz;
(function (metaviz) {
    metaviz.metavizApp = angular.module('metaviz', [
        'ngResource',
        'ui.bootstrap.popover',
        'ui.bootstrap.tpls',
        'ngDialog'
    ]);
})(metaviz || (metaviz = {}));
var metaviz;
(function (metaviz) {
    var MainController = (function () {
        function MainController($scope) {
            this._scope = $scope;
            this._scope.message = "Hello, this is metaviz ...";
            console.log(this._scope.message);
        }
        MainController.$inject = ['$scope', MainController];
        return MainController;
    }());
    metaviz.MainController = MainController;
    metaviz.metavizApp
        .controller('MainController', MainController.$inject);
})(metaviz || (metaviz = {}));
var metaviz;
(function (metaviz) {
    var ShortNumberFilter = (function () {
        function ShortNumberFilter() {
        }
        ShortNumberFilter.filter = function () {
            return function (num) {
                if (num) {
                    var abs = Math.abs(num);
                    if (abs >= Math.pow(10, 12)) {
                        num = (num / Math.pow(10, 12)).toFixed(1) + "T";
                    }
                    else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
                        num = (num / Math.pow(10, 9)).toFixed(1) + "B";
                    }
                    else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
                        num = (num / Math.pow(10, 6)).toFixed(1) + "M";
                    }
                    else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
                        num = (num / Math.pow(10, 3)).toFixed(1) + "K";
                    }
                    return num;
                }
            };
        };
        ShortNumberFilter.$inject = [ShortNumberFilter.filter];
        return ShortNumberFilter;
    }());
    metaviz.ShortNumberFilter = ShortNumberFilter;
    metaviz.metavizApp
        .filter('shortNumber', ShortNumberFilter.$inject);
})(metaviz || (metaviz = {}));
var metaviz;
(function (metaviz) {
    "use strict";
    var HelloFactory = (function () {
        function HelloFactory() {
            this.hello = function () {
                console.log("Hello, this is HelloFactory");
            };
        }
        HelloFactory.factory = function () {
            var instance = function () {
                return new HelloFactory();
            };
            return instance;
        };
        HelloFactory.$inject = [HelloFactory.factory()];
        return HelloFactory;
    }());
    metaviz.HelloFactory = HelloFactory;
    metaviz.metavizApp
        .factory('HelloService', HelloFactory.$inject);
})(metaviz || (metaviz = {}));
