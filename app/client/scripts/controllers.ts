/**
 * Created by asem on 06/06/17.
 */
"use strict";
module wevote {

    interface MainControllerScope extends ng.IScope {
        showInput: Boolean,
        error: Boolean,
        message: String,
    }
    export class MainController {
        static readonly $inject: any = ['$scope', MainController];
        private _scope: MainControllerScope;

        constructor($scope: ng.IScope) {
            this._scope = <MainControllerScope>$scope;
            this._scope.showInput = false;
            this._scope.error = false;
            this._scope.message = "Loading ...";
        }

    }

    interface ReadsSourceType {
        readonly value: string;
        readonly label: string;
    }

    interface InputControllerScope extends ng.IScope {
        availableDatabaseLoaded: Boolean,
        supportedAlgorithmsLoaded: Boolean,
        availableDatabase: any,
        showInput: Boolean,
        areDataLoaded: any,
        error: Boolean,
        message: String,
        supportedAlgorithms: any,
        experiment: any,
        inputForm: any,
        readsSources: any,
        taxonomySources: any,
        noAlgorithmChosen: Boolean,
        postExperiment: any,
        readsUploader: any,
        readsUploaderPostValidation: Boolean,
        taxonomyUploader: any,
        taxonomyUploaderPostValidation: Boolean
    }
    export class InputController {

        static readonly $inject = ['$scope', 'SimulatedReadsService',
            'AlgorithmsService', 'ExperimentService', InputController];

        private _scope: InputControllerScope;

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

        constructor($scope: ng.IScope, private SimulatedReadsService: any,
            private AlgorithmsService: any, private ExperimentService: any) {
            this._scope = <InputControllerScope>$scope;
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


    interface UploaderControllerScope extends ng.IScope {
        uploader: any,
        experiment: any
    }
    abstract class UploaderController {
        protected _scope: UploaderControllerScope;
        protected _uploader: any;

        protected abstract onSuccessItemCB: OnSuccessCBType;

        protected abstract onAfterAddingFileCB: OnAfterAddingFileCBType;

        constructor($scope: ng.IScope, FileUploaderService: any) {
            this._scope = <UploaderControllerScope>$scope;

        }
    }

    export class ReadsUploaderController extends UploaderController {
        static readonly $inject = ['$scope', 'FileUploaderService', ReadsUploaderController];

        constructor($scope: ng.IScope, FileUploaderService: any) {
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
        static readonly $inject = ['$scope', 'FileUploaderService', TaxonomyUploaderController];

        constructor($scope: ng.IScope, FileUploaderService: any) {
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

    export class ResultsController {
        static readonly $inject = ['$scope', ResultsController];
        private _scope: ng.IScope;

        constructor($scope: ng.IScope) {
            this._scope = $scope;
            $("#phyltree-a").click(function (e) {
                e.preventDefault();
            });
            $("#phyltable-a").click(function (e) {
                e.preventDefault();
            });
        }
    }



    interface HeaderControllerScope extends ng.IScope {
        loggedIn: Boolean,
        username: string,
        loginDialog: ng.dialog.IDialogOpenResult,
        registerDialog: ng.dialog.IDialogOpenResult,
        isState: (state: any) => Boolean;
        logOut: () => void;
        openLogin: () => void;
        openRegister: () => void;
    }

    export class HeaderController {
        static readonly $inject = ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthService', HeaderController];
        private _scope: HeaderControllerScope;
        private _state: ng.ui.IStateService;
        private _rootScope: ng.IRootScopeService;
        private _ngDialog: ng.dialog.IDialogService;
        private _auth: AuthFactory;

        constructor($scope: ng.IScope, $state: ng.ui.IStateService,
            $rootScope: ng.IRootScopeService, ngDialog: ng.dialog.IDialogService,
            auth: AuthFactory) {
            this._scope = <HeaderControllerScope>$scope;
            this._scope.loggedIn = false;
            this._scope.username = '';
            this._state = $state;
            this._rootScope = $rootScope;
            this._ngDialog = ngDialog;
            this._auth = auth;

            this._scope.isState = (state: string) => {
                return $state.is(state);
            }

            this._scope.logOut = () => {
                this._auth.logout();
                this._scope.loggedIn = false;
                this._scope.username = '';
            }

            this._scope.openLogin = () => {
                this._ngDialog.open(<any>{
                    template: 'views/login.html',
                    scope: this._scope,
                    className: 'ngdialog-theme-default',
                    controller: 'LoginController',
                    showClose: false
                });
            }

            this._scope.openRegister = () => {
                this._ngDialog.open(<any>{
                    template: 'views/register.html',
                    scope: this._scope,
                    className: 'ngdialog-theme-default',
                    controller: "RegisterController",
                    showClose: false
                });
            }

            this._rootScope.$on('login:Successful', () => {
                this._scope.loggedIn = this._auth.isAuthenticated();
                this._scope.username = this._auth.getUsername();
            });

            this._rootScope.$on('registration:Successful', () => {
                this._scope.loggedIn = this._auth.isAuthenticated();
                this._scope.username = this._auth.getUsername();
            });

            if (this._auth.isAuthenticated()) {
                this._scope.loggedIn = true;
                this._scope.username = this._auth.getUsername();
            }

        }
    }

    interface ILoginData {
        username: String;
        password: String;
    }
    interface LoginControllerScope extends ng.IScope {
        rememberMe: Boolean;
        loginData: ILoginData;
        doLogin: () => void;
        openRegister: () => void;
    }
    export class LoginController {
        static readonly $inject = ['$scope', 'ngDialog', 'LocalStorageService', 'AuthService', LoginController];
        private _scope: LoginControllerScope;
        private _ngDialog: ng.dialog.IDialogService;
        private _localStorage: LocalStorageFactory;
        private _auth: AuthFactory;

        constructor($scope: ng.IScope, ngDialog: ng.dialog.IDialogService,
            $localStorage: LocalStorageFactory, auth: AuthFactory) {
            this._scope = <LoginControllerScope>$scope;
            this._ngDialog = ngDialog;
            this._localStorage = $localStorage;
            this._auth = auth;

            this._scope.loginData = this._localStorage.getObject('userinfo', {username:'',password:''});
            this._scope.doLogin = () => {
                if (this._scope.rememberMe)
                    this._localStorage.storeObject('userinfo', this._scope.loginData);
                this._auth.login(this._scope.loginData,
                    () => { this._ngDialog.closeAll(); });
            }
            this._scope.openRegister = () => {
                this._ngDialog.open(<any>{
                    template: 'views/register.html',
                    scope: this._scope,
                    className: 'ngdialog-theme-default',
                    controller: "RegisterController"
                });
            }
        }
    }

    interface IRegistration {
        username: String,
        password: String,
        email: String,
        firstname: String,
        lastname: String,
        rememberMr: Boolean
    }
    interface RegisterControllerScope extends ng.IScope {
        registration: IRegistration;
        doRegister: () => void;
    }

    export class RegisterController {
        static readonly $inject = ['$scope', 'ngDialog', 'LocalStorageService', 'AuthService', RegisterController];
        private _scope: RegisterControllerScope;
        private _ngDialog: ng.dialog.IDialogService;
        private _localStorage: LocalStorageFactory;
        private _auth: AuthFactory;

        constructor($scope: ng.IScope, ngDialog: ng.dialog.IDialogService,
            $localStorage: LocalStorageFactory, auth: AuthFactory) {
            this._scope = <RegisterControllerScope>$scope;
            this._ngDialog = ngDialog;
            this._localStorage = $localStorage;
            this._auth = auth;

            this._scope.doRegister = () => {
                console.log('Doing registration', this._scope.registration);
                this._auth.register(this._scope.registration,
                    () => { this._ngDialog.closeAll(); });
            };
        }
    }

    interface ExperimentControllerScope extends ng.IScope {
        experiments: any,
        showExperiments: Boolean,
        experimentsError: Boolean,
        experimentsMessage: String
    }

    export class ExperimentController {
        static readonly $inject = ['$scope', 'ExperimentService', ExperimentController];
        private _scope: ExperimentControllerScope;

        constructor($scope: ng.IScope, private ExperimentService: any) {
            this._scope = <ExperimentControllerScope>$scope;
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
        .controller('LoginController', LoginController.$inject)
        .controller('RegisterController', RegisterController.$inject)
        .controller('ExperimentController', ExperimentController.$inject)
        .controller('ResultsController', ResultsController.$inject);
}