module wevote {
    "use strict";
    var env = {};

    // Import variables if present (from env.js)
    if (window) {
        console.log(window);
        (<any>Object).assign(env, (<any>window).__env);
    }


    export let wevoteApp =
        angular.module('wevote', ['ui.router', 'ngResource', 'angularFileUpload', 'ui.bootstrap.popover', 'ui.bootstrap.tpls', 'ngDialog', 'metaviz'])
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

                        .state('app.results', {
                            url: 'results/:expId',
                            views: {
                                'content@': {
                                    templateUrl: "views/results.html",
                                    controller: "ExperimentController"
                                }
                            }
                        })
                        .state('app.track', {
                            url: 'track',
                            views: {
                                'content@': {
                                    templateUrl: "views/experiment.html"
                                }
                            }
                        })

                        .state('app.info', {
                            url: 'info',
                            views: {
                                'content@': {
                                    templateUrl: "views/info.html",
                                }
                            }
                        })

                        .state('app.login' , {
                            url: 'login' , 
                            views: {
                                'content@':{
                                    templateUrl: 'views/login.html' , 
                                    controller: 'LoginController'
                                }
                            }
                        })

                        .state('app.register' , {
                            url: 'register' , 
                            views: {
                                'content@' :{
                                    templateUrl: 'views/register.html' , 
                                    controller: 'RegisterController'
                                }
                            }
                        })

                        ;
                    $urlRouterProvider.otherwise('/');
                }])

            .constant('__env', env)

        ;

}