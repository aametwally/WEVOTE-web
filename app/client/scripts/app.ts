module wevote {
    "use strict";
    export let wevoteApp =
        angular.module('wevote', ['ui.router', 'ngResource', 'angularFileUpload'])
            .config(['$stateProvider', '$urlRouterProvider',
                function ($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
                    $stateProvider
                    // route for the home page
                        .state('app', {
                            url: '/',
                            views: {
                                'header': {
                                    templateUrl: 'views/header.html'
                                },
                                'content': {
                                    templateUrl: "views/main.html",
                                    controller: 'MainController'
                                },
                                'footer': {
                                    templateUrl: 'views/footer.html'
                                }
                            }
                        })

                        .state('app.info', {
                            url: 'help',
                            views: {
                                'content@': {
                                    template: '<h1>Help To be Completed</h1>'
                                }
                            }
                        })

                        .state('app.feedback', {
                            url: 'feedback',
                            views: {
                                'content@': {
                                    template: '<h1>Feedback To be Completed</h1>'
                                }
                            }
                        })

                    ;
                    $urlRouterProvider.otherwise('/');
                }])


            .filter('shortNumber', function () {
                return function (number: any) {
                    if (number) {
                        var abs = Math.abs(number);
                        if (abs >= Math.pow(10, 12)) {
                            // trillion
                            number = (number / Math.pow(10, 12)).toFixed(1) + "T";
                        } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
                            // billion
                            number = (number / Math.pow(10, 9)).toFixed(1) + "B";
                        } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
                            // million
                            number = (number / Math.pow(10, 6)).toFixed(1) + "M";
                        } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
                            // thousand
                            number = (number / Math.pow(10, 3)).toFixed(1) + "K";
                        }
                        return number;
                    }
                };
            })
    ;

}