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

    .controller('InputController', ['$scope', 'availableDatabaseFactory', 'algorithmsFactory', 'experimentFactory',
        function ($scope, availableDatabaseFactory, algorithmsFactory, experimentFactory) {
            $scope.inputForm = {};

            var readsSources = [{
                    value: "client",
                    label: "Upload reads file"
                },
                {
                    value: "server",
                    label: "Use simulated reads from the server"
                }
            ];

            var taxonomySources = [{
                    value: "NCBI",
                    label: "Use NCBI taxonomy database"
                },
                {
                    value: "custom",
                    label: "Upload custom taxonomy database"
                }
            ];

            $scope.readsSources = readsSources;
            $scope.taxonomySources = taxonomySources;


            var emptyInput = {
                user: "public",
                email: "",
                description: "",
                private: false,
                readsSource: readsSources[0].value,
                taxonomySource: taxonomySources[0].value,
                reads: {
                    name: "",
                    description: "",
                    onServer: true,
                    uri: "",
                    data: "",
                    size: ""
                },
                taxonomy: {
                    name: "",
                    description: "",
                    onServer: true,
                    uri: "",
                    data: "",
                    size: ""
                },
                config: {
                    minScore: 0,
                    minNumAgreed: 0,
                    penalty: 2,
                    algorithms: ""
                }

            };

            $scope.availableDatabase = {};
            $scope.supportedAlgorithms = {};
            $scope.availableDatabaseLoaded = false;
            $scope.supportedAlgorithmsLoaded = false;

            $scope.areDataLoaded = function () {
                return $scope.availableDatabaseLoaded &&
                    $scope.supportedAlgorithmsLoaded;
            };

            availableDatabaseFactory.getAvailableDatabase().query(
                function (response) {
                    $scope.availableDatabase = response;
                    $scope.availableDatabaseLoaded = true;
                    $scope.showInput = $scope.areDataLoaded();
                    console.log($scope.showInput);
                },
                function (response) {
                    $scope.error = true;
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                });

            algorithmsFactory.getSupportedAlgorithms().query(
                function (response) {
                    $scope.supportedAlgorithms = response;
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
            $scope.experiment = JSON.parse(JSON.stringify(emptyInput));

            $scope.noAlgorithmChosen = false;
            $scope.postExperiment = function () {
                console.log('postExperiment() invoked.');
                console.log($scope.experiment);
                $scope.experiment.config.algorithms = $scope.usedAlgorithms();
                $scope.noAlgorithmChosen = $scope.usedAlgorithms().length === 0;


                if (!$scope.noAlgorithmChosen) {
                    experimentFactory.submit($scope.experiment);
                    $scope.experiment = JSON.parse(JSON.stringify(emptyInput));

                    $scope.inputForm.form.$setPristine();
                    $scope.inputForm.form.$setUntouched();
                }
            };

           
            $scope.readsUploader = {};
            $scope.readsUploaderPostValidation = true;
            $scope.taxonomyUploader = {};
            $scope.taxonomyUploaderPostValidation = true;
        }
    ])

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