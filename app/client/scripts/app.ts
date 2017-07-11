module wevote {
    "use strict";
    export let wevoteApp =
        angular.module('wevote', ['ui.router', 'ngResource', 'angularFileUpload','ui.bootstrap.popover', 'ui.bootstrap.tpls'])
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

                        .state('app.results' , {
                            url: 'results',
                            views: {
                                'content@': {
                                    templateUrl: "views/results.html",
                                    controller: "ResultsController"
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



    ;

}