/**
 * Created by asem on 06/06/17.
 */
'use strict';
angular.module('wevoteApp')

    .controller('MainController', ['$scope', function ($scope) {

    }])

    .controller('InputController', ['$scope', 'availableDatabaseFactory',
        function ($scope, availableDatabaseFactory) {


            var emptyInput = {
                readsFile: "",
                dataset: "",
                externalDatabase: "",
                email: "",
                description: ""
            };

            $scope.availableDatabase = availableDatabaseFactory.getAvailableDatabase();

            $scope.newExperiment = emptyInput;

            $scope.postExperiment = function () {
                console.log('postExperiment() invoked.');
                console.log($scope.newExperiment);
                $scope.newExperiment = emptyInput;
                $scope.inputForm.$setPristine();
            };

        }])

    .controller('DatasetUploaderController', ['$scope', 'fileUploaderFactory', function ($scope, fileUploaderFactory) {
        var datasetUploader = fileUploaderFactory.getFileUploader(
            'uploaded/dataset', 'Drop dataset here', 'External dataset uploader');

        $scope.uploader = datasetUploader;
    }])

    .controller('DatabaseUploaderController', ['$scope', 'fileUploaderFactory', function ($scope, fileUploaderFactory) {
        var databaseUploader = fileUploaderFactory.getFileUploader(
            'uploaded/database', 'Drop external database here', 'External database uploader');

        $scope.uploader = databaseUploader;
    }])


    .controller('HeaderController', ['$scope', function ($scope) {

    }])

    .controller('InfoController', ['$scope', function ($scope) {

    }])

    .controller('FeedbackController', ['$scope', function ($scope) {


    }])

;