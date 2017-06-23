'use strict';
angular.module('wevoteApp', ['ui.router','ngResource','angularFileUpload'])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html'
                    },
                    'content': {
                        templateUrl : "views/main.html",
                        controller  : 'MainController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html'
                    }
                }
            })

            .state('app.info', {
                url:'help',
                views: {
                    'content@': {
                        template: '<h1>Help To be Completed</h1>'
                    }
                }
            })

            .state('app.feedback', {
                url:'feedback',
                views: {
                    'content@': {
                        template: '<h1>Feedback To be Completed</h1>'
                    }
                }
            })

        ;
        $urlRouterProvider.otherwise('/');
    })


;