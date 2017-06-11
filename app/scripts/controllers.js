/**
 * Created by asem on 06/06/17.
 */
'use strict';
angular.module('wevoteApp')

    .controller('MainController', ['$scope', function ($scope) {
        $scope.showInput = false;
        $scope.error = false;
        $scope.message = "Loading ...";
    }])

    .controller('InputController', ['$scope', 'availableDatabaseFactory', 'algorithmsFactory',
        function ($scope, availableDatabaseFactory, algorithmsFactory) {

            var readsSources = [
                {value: "client", label: "Upload reads file"},
                {value: "server", label: "Use simulated reads from the server"}];

            var taxonomySources = [
                {value: "NCBI", label: "Use NCBI taxonomy database"},
                {value: "custom", label: "Upload custom taxonomy database"}];

            $scope.readsSources = readsSources;
            $scope.taxonomySources = taxonomySources;

            var emptyInput = {
                readsFile: "",
                readsSource: readsSources[0].value,
                taxonomySource: taxonomySources[0].value,
                config: {
                    taxonomy: taxonomySources[0].value,
                    minScore: 0,
                    minNumAgreed: 0,
                    penalty: 2,
                    algorithms: ""
                },
                email: "",
                description: ""
            };

            $scope.availableDatabase = {};
            $scope.supportedAlgorithms = {};
            $scope.availableDatabaseLoaded = false;
            $scope.supportedAlgorithmsLoaded = false;

            $scope.areDataLoaded = function () {
                return $scope.availableDatabaseLoaded &&
                    $scope.supportedAlgorithmsLoaded ;
            };

            availableDatabaseFactory.getAvailableDatabase()
                .then(
                    function (response) {
                        $scope.availableDatabase = response.data;
                        $scope.availableDatabaseLoaded = true;
                        $scope.showInput = $scope.areDataLoaded();
                        console.log($scope.showInput);
                    },
                    function (response) {
                        $scope.error = true;
                        $scope.message = "Error: " + response.status + " " + response.statusText;
                    });

            algorithmsFactory.getSupportedAlgorithms()
                .then(
                    function (response) {
                        $scope.supportedAlgorithms = response.data;
                        $scope.supportedAlgorithms.forEach(function (alg) {
                            alg.used = true;
                        });
                        $scope.supportedAlgorithmsLoaded = true;
                        $scope.showInput = $scope.areDataLoaded();
                        console.log($scope.showInput);
                    },
                    function (response) {
                        $scope.error = true;
                        $scope.message = "Error: " + response.status + " " + response.statusText;
                    });

            $scope.usedAlgorithms = function () {
                return $scope.supportedAlgorithms.filter(function (alg) {
                    return alg.used;
                });
            };
            $scope.experiment = emptyInput;

            $scope.noAlgorithmChosen = false;
            $scope.postExperiment = function () {
                console.log('postExperiment() invoked.');
                console.log($scope.experiment);
                $scope.experiment.config.algorithms = $scope.usedAlgorithms();
                $scope.noAlgorithmChosen = $scope.usedAlgorithms().length === 0;
                if (!$scope.noAlgorithmChosen) {
                    $scope.experiment = emptyInput;
                    $scope.inputForm.$setPristine();
                }
            };

            $scope.readsUploader = {};
            $scope.readsUploaderPostValidation = true;
            $scope.taxonomyUploader = {};
            $scope.taxonomyUploaderPostValidation = true;
        }])

    .controller('ReadsUploaderController', ['$scope', 'fileUploaderFactory', function ($scope, fileUploaderFactory) {
        var datasetUploader = fileUploaderFactory.getFileUploader(
            'uploaded/dataset', 'Drop reads file here', 'External dataset uploader', false);

        $scope.readsUploader = datasetUploader;
        $scope.uploader = datasetUploader;
    }])

    .controller('TaxonomyUploaderController', ['$scope', 'fileUploaderFactory', function ($scope, fileUploaderFactory) {
        var taxonomyUploader = fileUploaderFactory.getFileUploader(
            'uploaded/taxonomy', 'Drop taxonomy file here', 'Custom taxonomy uploader', false);

        $scope.taxonomyUploader = taxonomyUploader;
        $scope.uploader = taxonomyUploader;
    }])

    .controller('HeaderController', ['$scope', function ($scope) {
        $("#loginButton").click(function () {
            $("#loginModal").modal('toggle');
        });
    }])

    .controller('InfoController', ['$scope', function ($scope) {

    }])

    .controller('FeedbackController', ['$scope', function ($scope) {


    }])

;