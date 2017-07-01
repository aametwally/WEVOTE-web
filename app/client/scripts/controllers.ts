/**
 * Created by asem on 06/06/17.
 */
"use strict";
module wevote {
    export class MainController {
        static readonly $inject: any = ['$scope', MainController];
        private _scope: ng.IScope;

        constructor($scope: ng.IScope) {
            this._scope = $scope;
            this._scope.showInput = false;
            this._scope.error = false;
            this._scope.message = "Loading ...";
        }

    }

    interface ReadsSourceType {
        readonly value: string;
        readonly label: string;
    }

    export class InputController {

        static readonly $inject = ['$scope', 'SimulatedReadsService',
            'AlgorithmsService', 'ExperimentService', InputController];

        private _scope: ng.IScope;

        private readonly readsSources: ReadsSourceType[] = [{
            value: "client",
            label: "Upload reads file"
        },
            {
                value: "server",
                label: "Use simulated reads from the server"
            }
        ];

        private readonly taxonomySources: ReadsSourceType[] = [{
            value: "NCBI",
            label: "Use NCBI taxonomy database"
        },
            {
                value: "custom",
                label: "Upload custom taxonomy database"
            }
        ];

        private readonly emptyInput: any = {
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

        private areDataLoaded = () => {
            return this._scope.availableDatabaseLoaded &&
                this._scope.supportedAlgorithmsLoaded;
        };

        private onSimulateReadsSuccess: Function = (response: any) => {
            this._scope.availableDatabase = response;
            this._scope.availableDatabaseLoaded = true;
            this._scope.showInput = this._scope.areDataLoaded();
            console.log(this._scope.showInput);
        }

        private onSimulatedReadsFail: Function = (response: any) => {
            this._scope.error = true;
            this._scope.message = "Error: " + response.status + " " + response.statusText;
        }

        private onSupportedAlgorithmsSuccess: Function = (response: any) => {
            this._scope.supportedAlgorithms = response;
            this._scope.supportedAlgorithms.forEach(function (alg: any) {
                alg.used = true;
            });
            this._scope.supportedAlgorithmsLoaded = true;
            this._scope.showInput = this._scope.areDataLoaded();
            console.log(this._scope.showInput);
        }

        private onSupportedAlgorithmsFail: Function = (response: any) => {
            this._scope.error = true;
            this._scope.message = "Error: " + response.status + " " + response.statusText;
        }

        private getUsedAlgorithms = () => {
            return this._scope.supportedAlgorithms.filter(function (alg: any) {
                return alg.used;
            });
        }

        private postExperiment = (form: any) => {
            console.log('postExperiment() invoked.');
            console.log(this._scope.experiment);
            this._scope.experiment.config.algorithms = this.getUsedAlgorithms();
            let noAlgorithmChosen: boolean = this.getUsedAlgorithms().length === 0;

            if (!noAlgorithmChosen) {
                this.ExperimentService.submit(this._scope.experiment);
                this._scope.experiment = JSON.parse(JSON.stringify(this.emptyInput));
                form.$setPristine();
                form.$setUntouched();
                $('#advanced').collapse("hide");
            }
        }

        constructor($scope: any, private SimulatedReadsService: any,
                    private AlgorithmsService: any, private ExperimentService: any) {
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

    interface OnSuccessCBType {
        (fileItem: any, response: any, status: any, headers: any): void;
    }
    interface OnAfterAddingFileCBType {
        (fileItem: any): void;
    }

    abstract class UploaderController {
        protected _scope: ng.IScope;
        protected _uploader: any;

        protected abstract onSuccessItemCB: OnSuccessCBType;

        protected abstract onAfterAddingFileCB: OnAfterAddingFileCBType;

        constructor($scope: ng.IScope, FileUploaderService: any) {
            this._scope = $scope;

        }
    }

    export class ReadsUploaderController extends UploaderController {
        static readonly $inject =['$scope', 'FileUploaderService',ReadsUploaderController];

        constructor($scope: any, FileUploaderService: any) {
            super($scope, FileUploaderService);
            this._uploader = FileUploaderService.getFileUploader(
                'upload/reads', 'Drop reads file here', 'External dataset uploader');
            this._uploader.onSuccessItem = this.onSuccessItemCB;
            this._uploader.onAfterAddingFile = this.onAfterAddingFileCB;
            this._scope.uploader = this._uploader;
        };

        protected onSuccessItemCB = (fileItem: any, response: any, status: any, header: any) => {
            // console.info('onSuccessItem', fileItem, response, status, headers);
            console.log('success', response, header);
            this._scope.experiment.reads.uri =
                JSON.parse(JSON.stringify(header.filename));
            this._scope.experiment.reads.count =
                parseInt(header.readscount, 10);
        };

        protected onAfterAddingFileCB = (fileItem: any) => {
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
    }

    export class TaxonomyUploaderController extends UploaderController {
        static readonly $inject  = ['$scope', 'FileUploaderService',TaxonomyUploaderController];

        constructor($scope: any, FileUploaderService: any) {
            super($scope, FileUploaderService)
            this._uploader = FileUploaderService.getFileUploader(
                'upload/taxonomy', 'Drop taxonomy file here', 'Custom taxonomy uploader');
            this._uploader.onSuccessItem = this.onSuccessItemCB;
            this._uploader.onAfterAddingFile = this.onAfterAddingFileCB;
            this._scope.uploader = this._uploader;
        }

        protected onSuccessItemCB = (fileItem: any, response: any, status: any, headers: any) => {
            // console.info('onSuccessItem', fileItem, response, status, headers);
            console.log('success', response, headers);
            this._scope.experiment.taxonomy.uri =
                JSON.parse(JSON.stringify(headers.filename));
        };

        protected onAfterAddingFileCB = (fileItem: any) => {
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
    }


    export class HeaderController {
        static readonly $inject = ['$scope', HeaderController];
        private _scope: ng.IScope;

        constructor($scope: any) {
            this._scope = $scope;
            $("#loginButton").click(function () {
                $("#loginModal").modal('toggle');
            });
        }
    }

    export class ExperimentController {
        static readonly $inject = ['$scope', 'ExperimentService',ExperimentController];
        private _scope: ng.IScope;

        constructor($scope: ng.IScope, private ExperimentService: any) {
            this._scope = $scope;
            this._scope.experiments = {};
            this._scope.showExperiments = false;
            this._scope.experimentsError = false;
            this._scope.experimentsMessage = "Loading ...";
            ExperimentService.retrieve(this.onExperimentsLoadedSuccess, this.onExperimentsLoadedFail);
        }

        private onExperimentsLoadedSuccess: Function = (response: any) => {
            this._scope.experiments = response;
            this._scope.showExperiments = true;
            setTimeout(() => {
                $("[data-toggle='tooltip']").tooltip({
                    trigger: 'hover',
                    placement: 'top'
                });

                this._scope.experiments.forEach(function (exp: any) {
                    $('#' + exp._id).popover({
                        html: true,
                        trigger: "focus",
                        placement: "bottom",
                        content: function () {
                            return $('#data-' + exp._id).html();
                        }
                    });
                    $('#' + exp._id).click(function (e) {
                        // Special stuff to do when this link is clicked...

                        // Cancel the default action
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
                        // Special stuff to do when this link is clicked...

                        // Cancel the default action
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
                        // Special stuff to do when this link is clicked...

                        // Cancel the default action
                        e.preventDefault();
                    });
                });

            }, 1000);
        }

        private onExperimentsLoadedFail: Function = (response: any) => {
            this._scope.experimentsError = true;
            this._scope.experimentsMessage = "Error: " + response.status + " " + response.statusText;
        }

    }

    wevoteApp
        .controller('MainController', MainController.$inject)
        .controller('InputController', InputController.$inject)
        .controller('ReadsUploaderController', ReadsUploaderController.$inject)
        .controller('TaxonomyUploaderController', TaxonomyUploaderController.$inject)
        .controller('HeaderController', HeaderController.$inject)
        .controller('ExperimentController', ExperimentController.$inject)
}