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
                source: "client",
                config: {
                    taxonomy:"",
                    scoreThreshold:"",
                    nAgreed:"",
                    penalty:"",
                    algorithms:""
                },
                preview: {
                    email: "",
                    description: ""
                }
            };

            $scope.availableDatabase = availableDatabaseFactory.getAvailableDatabase();

            $scope.experiment = emptyInput;

            $scope.postExperiment = function () {
                console.log('postExperiment() invoked.');
                console.log($scope.experiment);
                $scope.experiment = emptyInput;
                $scope.inputForm.$setPristine();
            };

        }])

    .controller('ReadsUploaderController', ['$scope', 'fileUploaderFactory', function ($scope, fileUploaderFactory) {
        var datasetUploader = fileUploaderFactory.getFileUploader(
            'uploaded/dataset', 'Drop reads file here', 'External dataset uploader', false);

        $scope.uploader = datasetUploader;
    }])

    .controller('ConfigController', ['$scope', 'algorithmsFactory', function ($scope,algorithmsFactory) {
        $scope.supportedAlgorithms = algorithmsFactory.getSupportedAlgorithms();
    }])


    .controller('HeaderController', ['$scope', function ($scope) {

    }])

    .controller('InfoController', ['$scope', function ($scope) {

    }])

    .controller('FeedbackController', ['$scope', function ($scope) {


    }])

;