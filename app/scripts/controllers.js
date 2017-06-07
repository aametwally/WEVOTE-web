/**
 * Created by asem on 06/06/17.
 */
'use strict';
angular.module('wevoteApp')

    .controller('MainController', ['$scope', function ($scope) {

    }])

    .controller('InputController', ['$scope', function ($scope) {
        var emptyInput = {
            readsFile: "",
            genomes: "",
            customGenomesFiles: "",
            email: "",
            description: ""
        };
        $scope.newExperiment = emptyInput;

        $scope.postExperiment = function () {
            console.log('postExperiment() invoked.');
            console.log($scope.newExperiment);
            $scope.newExperiment = emptyInput;
            $scope.inputForm.$setPristine();
        };

    }])

    .controller('UploadController', ['$scope', 'angularUploader',
        function ($scope, angularUploader) {
            $scope.readsUploader =
                angularUploader.getFileUploader( 'uploaded/reads' , "input reads");
            $scope.databaseUploader =
                angularUploader.getFileUploader( 'uploaded/database' , "external database");

            $scope.uploaders = [$scope.readsUploader,$scope.databaseUploader ]
        }])


    .controller('HeaderController', ['$scope', function ($scope) {
    }])

    .controller('InfoController', ['$scope', function ($scope) {

    }])

    .controller('FeedbackController', ['$scope', function ($scope) {


    }])

;