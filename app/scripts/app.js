
'use strict';

angular.module('wevoteApp', ['ui.router'])

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
                        template : '<h1>To be Completed</h1>',
                        controller  : 'MainController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html'
                    }
                }
            })

            .state('app.help', {
                url:'help',
                views: {
                    'content@': {
                        template: '<h1>To be Completed</h1>'
                    }
                }
            })

            .state('app.feedback', {
                url:'feedback',
                views: {
                    'content@': {
                        template: '<h1>To be Completed</h1>'
                    }
                }
            })

        ;
        $urlRouterProvider.otherwise('/');
    })


;