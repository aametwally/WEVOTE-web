"use strict";
var wevote;
(function (wevote) {
    wevote.wevoteApp = angular.module('wevote', ['ui.router', 'ngResource', 'angularFileUpload'])
        .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
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
            });
            $urlRouterProvider.otherwise('/');
        }])
        .filter('shortNumber', function () {
        return function (number) {
            if (number) {
                var abs = Math.abs(number);
                if (abs >= Math.pow(10, 12)) {
                    number = (number / Math.pow(10, 12)).toFixed(1) + "T";
                }
                else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
                    number = (number / Math.pow(10, 9)).toFixed(1) + "B";
                }
                else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
                    number = (number / Math.pow(10, 6)).toFixed(1) + "M";
                }
                else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
                    number = (number / Math.pow(10, 3)).toFixed(1) + "K";
                }
                return number;
            }
        };
    });
})(wevote || (wevote = {}));
var wevote;
(function (wevote) {
    class MainController {
        constructor($scope) {
            this._scope = $scope;
            this._scope.showInput = false;
            this._scope.error = false;
            this._scope.message = "Loading ...";
        }
    }
    MainController.$inject = ['$scope', MainController];
    wevote.MainController = MainController;
    class InputController {
        constructor($scope, SimulatedReadsService, AlgorithmsService, ExperimentService) {
            this.SimulatedReadsService = SimulatedReadsService;
            this.AlgorithmsService = AlgorithmsService;
            this.ExperimentService = ExperimentService;
            this.readsSources = [{
                    value: "client",
                    label: "Upload reads file"
                },
                {
                    value: "server",
                    label: "Use simulated reads from the server"
                }
            ];
            this.taxonomySources = [{
                    value: "NCBI",
                    label: "Use NCBI taxonomy database"
                },
                {
                    value: "custom",
                    label: "Upload custom taxonomy database"
                }
            ];
            this.emptyInput = {
                user: "public",
                email: "",
                description: "",
                private: false,
                readsSource: this.readsSources[0].value,
                taxonomySource: this.taxonomySources[0].value,
                reads: {
                    name: "",
                    description: "",
                    onServer: true,
                    uri: "",
                    data: "",
                    size: "",
                    count: 0
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
            this.areDataLoaded = () => {
                return this._scope.availableDatabaseLoaded &&
                    this._scope.supportedAlgorithmsLoaded;
            };
            this.onSimulateReadsSuccess = (response) => {
                this._scope.availableDatabase = response;
                this._scope.availableDatabaseLoaded = true;
                this._scope.showInput = this._scope.areDataLoaded();
                console.log(this._scope.showInput);
            };
            this.onSimulatedReadsFail = (response) => {
                this._scope.error = true;
                this._scope.message = "Error: " + response.status + " " + response.statusText;
            };
            this.onSupportedAlgorithmsSuccess = (response) => {
                this._scope.supportedAlgorithms = response;
                this._scope.supportedAlgorithms.forEach(function (alg) {
                    alg.used = true;
                });
                this._scope.supportedAlgorithmsLoaded = true;
                this._scope.showInput = this._scope.areDataLoaded();
                console.log(this._scope.showInput);
            };
            this.onSupportedAlgorithmsFail = (response) => {
                this._scope.error = true;
                this._scope.message = "Error: " + response.status + " " + response.statusText;
            };
            this.getUsedAlgorithms = () => {
                return this._scope.supportedAlgorithms.filter(function (alg) {
                    return alg.used;
                });
            };
            this.postExperiment = (form) => {
                console.log('postExperiment() invoked.');
                console.log(this._scope.experiment);
                this._scope.experiment.config.algorithms = this.getUsedAlgorithms();
                let noAlgorithmChosen = this.getUsedAlgorithms().length === 0;
                if (!noAlgorithmChosen) {
                    this.ExperimentService.submit(this._scope.experiment);
                    this._scope.experiment = JSON.parse(JSON.stringify(this.emptyInput));
                    form.$setPristine();
                    form.$setUntouched();
                    $('#advanced').collapse("hide");
                }
            };
            this._scope = $scope;
            this._scope.inputForm = {};
            this._scope.readsSources = this.readsSources;
            this._scope.taxonomySources = this.taxonomySources;
            this._scope.availableDatabase = {};
            this._scope.supportedAlgorithms = {};
            this._scope.availableDatabaseLoaded = false;
            this._scope.supportedAlgorithmsLoaded = false;
            this._scope.areDataLoaded = this.areDataLoaded;
            SimulatedReadsService.retrieve(this.onSimulateReadsSuccess, this.onSimulatedReadsFail);
            AlgorithmsService.retrieve(this.onSupportedAlgorithmsSuccess, this.onSupportedAlgorithmsFail);
            this._scope.experiment = JSON.parse(JSON.stringify(this.emptyInput));
            this._scope.noAlgorithmChosen = false;
            this._scope.postExperiment = () => {
                this.postExperiment(this._scope.inputForm.form);
            };
            this._scope.readsUploader = {};
            this._scope.readsUploaderPostValidation = true;
            this._scope.taxonomyUploader = {};
            this._scope.taxonomyUploaderPostValidation = true;
        }
    }
    InputController.$inject = ['$scope', 'SimulatedReadsService',
        'AlgorithmsService', 'ExperimentService', InputController];
    wevote.InputController = InputController;
    class UploaderController {
        constructor($scope, FileUploaderService) {
            this._scope = $scope;
        }
    }
    class ReadsUploaderController extends UploaderController {
        constructor($scope, FileUploaderService) {
            super($scope, FileUploaderService);
            this.onSuccessItemCB = (fileItem, response, status, header) => {
                console.log('success', response, header);
                this._scope.experiment.reads.uri =
                    JSON.parse(JSON.stringify(header.filename));
                this._scope.experiment.reads.count =
                    parseInt(header.readscount, 10);
            };
            this.onAfterAddingFileCB = (fileItem) => {
                console.info('onAfterAddingFile', fileItem);
                this._scope.uploader.queue = [fileItem];
                this._scope.experiment.reads.name =
                    JSON.parse(JSON.stringify(fileItem.file.name));
                this._scope.experiment.reads.size =
                    JSON.parse(JSON.stringify(fileItem.file.size));
                setTimeout(function () {
                    $("[data-toggle='tooltip']").tooltip({
                        trigger: 'hover'
                    });
                }, 500);
            };
            this._uploader = FileUploaderService.getFileUploader('upload/reads', 'Drop reads file here', 'External dataset uploader');
            this._uploader.onSuccessItem = this.onSuccessItemCB;
            this._uploader.onAfterAddingFile = this.onAfterAddingFileCB;
            this._scope.uploader = this._uploader;
        }
        ;
    }
    ReadsUploaderController.$inject = ['$scope', 'FileUploaderService', ReadsUploaderController];
    wevote.ReadsUploaderController = ReadsUploaderController;
    class TaxonomyUploaderController extends UploaderController {
        constructor($scope, FileUploaderService) {
            super($scope, FileUploaderService);
            this.onSuccessItemCB = (fileItem, response, status, headers) => {
                console.log('success', response, headers);
                this._scope.experiment.taxonomy.uri =
                    JSON.parse(JSON.stringify(headers.filename));
            };
            this.onAfterAddingFileCB = (fileItem) => {
                console.info('onAfterAddingFile', fileItem);
                this._scope.uploader.queue = [fileItem];
                this._scope.experiment.taxonomy.name =
                    JSON.parse(JSON.stringify(fileItem.file.name));
                this._scope.experiment.taxonomy.size =
                    JSON.parse(JSON.stringify(fileItem.file.size));
                setTimeout(function () {
                    $("[data-toggle='tooltip']").tooltip({
                        trigger: 'hover'
                    });
                }, 500);
            };
            this._uploader = FileUploaderService.getFileUploader('upload/taxonomy', 'Drop taxonomy file here', 'Custom taxonomy uploader');
            this._uploader.onSuccessItem = this.onSuccessItemCB;
            this._uploader.onAfterAddingFile = this.onAfterAddingFileCB;
            this._scope.uploader = this._uploader;
        }
    }
    TaxonomyUploaderController.$inject = ['$scope', 'FileUploaderService', TaxonomyUploaderController];
    wevote.TaxonomyUploaderController = TaxonomyUploaderController;
    class HeaderController {
        constructor($scope) {
            this._scope = $scope;
            $("#loginButton").click(function () {
                $("#loginModal").modal('toggle');
            });
        }
    }
    HeaderController.$inject = ['$scope', HeaderController];
    wevote.HeaderController = HeaderController;
    class ExperimentController {
        constructor($scope, ExperimentService) {
            this.ExperimentService = ExperimentService;
            this.onExperimentsLoadedSuccess = (response) => {
                this._scope.experiments = response;
                this._scope.showExperiments = true;
                setTimeout(() => {
                    $("[data-toggle='tooltip']").tooltip({
                        trigger: 'hover',
                        placement: 'top'
                    });
                    this._scope.experiments.forEach(function (exp) {
                        $('#' + exp._id).popover({
                            html: true,
                            trigger: "focus",
                            placement: "bottom",
                            content: function () {
                                return $('#data-' + exp._id).html();
                            }
                        });
                        $('#' + exp._id).click(function (e) {
                            e.preventDefault();
                        });
                        $('#' + 'desc-' + exp._id).popover({
                            html: true,
                            trigger: "focus",
                            placement: "bottom",
                            content: function () {
                                return $('#desc-data-' + exp._id).html();
                            }
                        });
                        $('#' + 'desc-' + exp._id).click(function (e) {
                            e.preventDefault();
                        });
                        $('#' + 'param-' + exp._id).popover({
                            html: true,
                            trigger: "focus",
                            placement: "bottom",
                            content: function () {
                                return $('#param-data-' + exp._id).html();
                            }
                        });
                        $('#' + 'param-' + exp._id).click(function (e) {
                            e.preventDefault();
                        });
                    });
                }, 1000);
            };
            this.onExperimentsLoadedFail = (response) => {
                this._scope.experimentsError = true;
                this._scope.experimentsMessage = "Error: " + response.status + " " + response.statusText;
            };
            this._scope = $scope;
            this._scope.experiments = {};
            this._scope.showExperiments = false;
            this._scope.experimentsError = false;
            this._scope.experimentsMessage = "Loading ...";
            ExperimentService.retrieve(this.onExperimentsLoadedSuccess, this.onExperimentsLoadedFail);
        }
    }
    ExperimentController.$inject = ['$scope', 'ExperimentService', ExperimentController];
    wevote.ExperimentController = ExperimentController;
    wevote.wevoteApp
        .controller('MainController', MainController.$inject)
        .controller('InputController', InputController.$inject)
        .controller('ReadsUploaderController', ReadsUploaderController.$inject)
        .controller('TaxonomyUploaderController', TaxonomyUploaderController.$inject)
        .controller('HeaderController', HeaderController.$inject)
        .controller('ExperimentController', ExperimentController.$inject);
})(wevote || (wevote = {}));
var wevote;
(function (wevote) {
    class FileUploaderFactory {
        constructor(FileUploader) {
            this.FileUploader = FileUploader;
            this._FileUploader = FileUploader;
        }
        static factory() {
            let instance = (FileUploader) => new FileUploaderFactory(FileUploader);
            return instance;
        }
        getFileUploader(url, label, description) {
            let uploader = new this.FileUploader({
                url: url
            });
            uploader.label = label;
            uploader.description = description;
            uploader.atLeastSingleFileUploaded = false;
            uploader.filters.push({
                name: 'customFilter',
                fn: function (item, options) {
                    return this.queue.length < 10;
                }
            });
            uploader.onWhenAddingFileFailed = function (item, filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };
            uploader.onAfterAddingAll = function (addedFileItems) {
                console.info('onAfterAddingAll', addedFileItems);
            };
            uploader.onBeforeUploadItem = function (item) {
                console.info('onBeforeUploadItem', item);
            };
            uploader.onProgressItem = function (fileItem, progress) {
                console.info('onProgressItem', fileItem, progress);
            };
            uploader.onProgressAll = function (progress) {
                console.info('onProgressAll', progress);
            };
            uploader.onErrorItem = function (fileItem, response, status, headers) {
                console.info('onErrorItem', fileItem, response, status, headers);
            };
            uploader.onCancelItem = function (fileItem, response, status, headers) {
                console.info('onCancelItem', fileItem, response, status, headers);
            };
            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                this.atLeastSingleFileUploaded = true;
            };
            uploader.onCompleteAll = function () {
                console.info('onCompleteAll');
                this.atLeastSingleFileUploaded = true;
            };
            return uploader;
        }
    }
    FileUploaderFactory.$inject = ['FileUploader'];
    wevote.FileUploaderFactory = FileUploaderFactory;
    class DataRetriever {
        constructor(baseURL, $resource) {
            this.baseURL = baseURL;
            this.$resource = $resource;
            this._baseURL = baseURL;
            this._resource = $resource;
        }
    }
    DataRetriever.$inject = ['baseURL', '$resource'];
    class SimulatedReadsFactory extends DataRetriever {
        constructor() {
            super(...arguments);
            this.retrieve = (cbS, cbF) => {
                console.log("retrieving simulated reads");
                return this._resource(this._baseURL + "reads", null, {
                    'update': {
                        method: 'PUT'
                    }
                }).query(cbS, cbF);
            };
        }
        static factory() {
            let instance = (baseURL, $resource) => new SimulatedReadsFactory(baseURL, $resource);
            return instance;
        }
    }
    wevote.SimulatedReadsFactory = SimulatedReadsFactory;
    class AlgorithmsFactory extends DataRetriever {
        constructor() {
            super(...arguments);
            this.retrieve = (cbS, cbF) => {
                return this._resource(this._baseURL + "algorithm", null, {
                    'update': {
                        method: 'PUT'
                    }
                }).query(cbS, cbF);
            };
        }
        static factory() {
            let instance = (baseURL, $resource) => new AlgorithmsFactory(baseURL, $resource);
            return instance;
        }
    }
    wevote.AlgorithmsFactory = AlgorithmsFactory;
    class ExperimentFactory extends DataRetriever {
        constructor() {
            super(...arguments);
            this.retrieve = (cbS, cbF) => {
                return this._resource(this._baseURL + "experiment", null, {
                    'update': {
                        method: 'PUT'
                    }
                }).query(cbS, cbF);
            };
        }
        static factory() {
            let instance = (baseURL, $resource) => new ExperimentFactory(baseURL, $resource);
            return instance;
        }
        submit(formdata) {
            return this._resource(this._baseURL + "experiment").save({}, formdata);
        }
    }
    wevote.ExperimentFactory = ExperimentFactory;
    wevote.wevoteApp
        .constant("baseURL", "http://localhost:3000/")
        .factory('FileUploaderService', FileUploaderFactory.factory())
        .factory('SimulatedReadsService', SimulatedReadsFactory.factory())
        .factory('AlgorithmsService', AlgorithmsFactory.factory())
        .factory('ExperimentService', ExperimentFactory.factory());
})(wevote || (wevote = {}));

//# sourceMappingURL=maps/wevote.js.map
