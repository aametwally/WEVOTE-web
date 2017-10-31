/**
 * Created by asem on 06/06/17.
 */
"use strict";
module wevote {

    interface MainControllerScope extends ng.IScope {
        showInput: boolean,
        error: boolean,
        message: string,
    }
    export class MainController {
        static readonly $inject: any = ['$scope', '$state' , 'HelloService', MainController];
        private _scope: MainControllerScope;
        private _hello: metaviz.HelloFactory;
        constructor($scope: ng.IScope, $state: ng.ui.IState , hello: metaviz.HelloFactory) {
            this._scope = <MainControllerScope>$scope;
            this._hello = hello;
            this._hello.hello();
            this._scope.showInput = false;
            this._scope.error = false;
            this._scope.message = "Loading ...";
        }
    }

    interface IUsageScenario {
        readonly value: string,
        readonly usage: string,
        readonly hint: string
    }

    interface ITaxonomySource {
        readonly value: string,
        readonly label: string
    }

    interface InputControllerScope extends ng.IScope {
        state: ng.ui.IStateService,
        availableDatabaseLoaded: boolean,
        supportedAlgorithmsLoaded: boolean,
        availableDatabase: any,
        showInput: boolean,
        areDataLoaded: any,
        error: boolean,
        message: string,
        formError: boolean,
        formErrorMessage: string,
        usageError: boolean,
        usageErrorMessage: string,
        emailError: boolean,
        emailErrorMessage: string,
        selectiveAlgorithms: boolean,
        noAlgorithmChosen: boolean,
        supportedAlgorithms: any,
        experiment: common.IExperiment,
        inputForm: any,
        usageScenarios: IUsageScenario[],
        taxonomySources: ITaxonomySource[],
        postExperiment: any,
        readsUploader: any,
        readsUploaderPostValidation: boolean,
        ensembleUploader: any,
        ensembleUploaderPostValidation: boolean
    }
    export class InputController {

        static readonly $inject = ['$scope','$state' , 'SimulatedReadsService',
            'AlgorithmsService', 'ExperimentService', InputController];

        private _scope: InputControllerScope;

        private readonly usageScenarios: IUsageScenario[] = [{
            value: "pipelineFromReads",
            usage: "Full Pipeline",
            hint: "upload reads file"
        },
        {
            value: "pipelineFromSimulatedReads",
            usage: "Full Pipeline",
            hint: "use simulated reads from the server"
        },
        {
            value: "classificationFromEnsemble",
            usage: "Classification",
            hint: "upload a wevote ensemble file"
        }
        ];

        private readonly taxonomySources: ITaxonomySource[] = [{
            value: "NCBI",
            label: "Use NCBI taxonomy database"
        },
        {
            value: "custom",
            label: "Upload custom taxonomy database"
        }
        ];


        private readonly emptyExperiment: common.IExperiment = {
            user: "public",
            email: "",
            description: "",
            isPrivate: false,
            usageScenario: this.usageScenarios[0],
            reads: {
                name: "",
                description: "",
                onServer: true,
                uri: "",
                data: "",
                size: 0,
                count: 0
            },
            ensemble: {
                name: "",
                description: "",
                uri: "",
                data: "",
                size: 0,
                count: 0
            },
            taxonomy: {
                name: this.taxonomySources[0].value,
                description: "",
                onServer: true,
                uri: "",
                data: "",
                size: 0,
                count: 0
            },
            config: {
                minScore: 0,
                minNumAgreed: 0,
                penalty: 2,
                algorithms: []
            }
        };

        constructor($scope: ng.IScope, $state: ng.ui.IStateService , private SimulatedReadsService: any,
            private AlgorithmsService: any, private ExperimentService: any) {
            this._scope = <InputControllerScope>$scope;
            this._scope.inputForm = {};
            this._scope.state = $state;
            this._scope.formError = false;
            this._scope.formErrorMessage = '';

            this._scope.emailError = false;
            this._scope.emailErrorMessage = '';

            this._scope.usageScenarios = this.usageScenarios;

            this._scope.availableDatabase = [];
            this._scope.selectiveAlgorithms = true;
            this._scope.supportedAlgorithms = [];
            this._scope.availableDatabaseLoaded = false;
            this._scope.supportedAlgorithmsLoaded = false;
            this._scope.areDataLoaded = this.areDataLoaded;
            SimulatedReadsService.retrieve(this.onSimulateReadsSuccess, this.onSimulatedReadsFail);
            AlgorithmsService.retrieve(this.onSupportedAlgorithmsSuccess, this.onSupportedAlgorithmsFail);
            this._scope.experiment = JSON.parse(JSON.stringify(this.emptyExperiment));

            this._scope.postExperiment = () => {
                if (!this._scope.formError) {
                    this._scope.experiment.usageScenario = this.getUsageScenarioOrReturn(this.usageScenarios[0]);
                    this._scope.experiment.config.algorithms = this.getUsedAlgorithms();
                    const email = `${this._scope.experiment.email}`;
                    this.ExperimentService.submit(
                        this._scope.experiment,
                        () => {
                            $('#submission-message').empty();
                            $('#submission-message').append(
                                `<div class="alert alert-success alert-dismissible show" role="alert"> 
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>
                            Experiment is <strong>successfully!</strong> submitted!<br>
                            You can track you experiment progress from 'Track Experiments' dash board.<br>
                            Anyway, after experiment finished, you will be received a notification at your email: ${email}.
                            You may need to check the junk mail. 
                            </div>`
                            );

                            $('#submission-message').get(0).scrollIntoView();
                            this._scope.$on('$stateChangeStart', () => {
                                $('#submission-message').empty();
                            });
                        },
                        () => {
                            $('#submission-message').empty();
                            $('#submission-message').append(
                                `<div class="alert alert-danger alert-dismissible show" role="alert"> 
                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                                </button>                                
                            Experiment is <strong>not</strong> submitted!<br>
                            You may need to login or check the connection to the server.
                            </div>`
                            );
                            $('#submission-message').get(0).scrollIntoView();
                            this._scope.$on('$stateChangeStart', () => {
                                $('#submission-message').empty();
                            });

                        });
                    this._scope.experiment = JSON.parse(JSON.stringify(this.emptyExperiment));
                    this._scope.inputForm.form.$setPristine();
                    this._scope.inputForm.form.$setUntouched();
                    $('#advanced').collapse("hide");
                }
            };

            this._scope.readsUploader = null;
            this._scope.readsUploaderPostValidation = true;
            this._scope.ensembleUploader = null;
            this._scope.ensembleUploaderPostValidation = true;

            // Watchers!
            // this._scope.experiment.usageScenario.value;
            this._scope.$watch('experiment.usageScenario.value', (usage: string) => {
                switch (usage) {
                    case 'pipelineFromReads':
                        {
                            this._scope.selectiveAlgorithms = true;
                        } break;
                    case 'pipelineFromSimulatedReads':
                        {
                            this._scope.selectiveAlgorithms = true;
                        } break;
                    case 'classificationFromEnsemble':
                        {
                            this._scope.selectiveAlgorithms = false;
                        } break;
                }
            });

            this._scope.$watchGroup(
                [
                    'experiment.usageScenario.value',
                    'readsUploader.atLeastSingleFileUploaded',
                    'readsUploaderPostValidation',
                    'ensembleUploader.atLeastSingleFileUploaded',
                    'ensembleUploaderPostValidation',
                    'postValidationError'
                ],
                (newVal: any, oldVal: any, scope: ng.IScope) => {
                    const noAlgorithmChosen =
                        (this._scope.supportedAlgorithms.length === 0) ? false : this.getUsedAlgorithms().length === 0;
                    this._scope.usageError = noAlgorithmChosen;
                    if (this._scope.inputForm.form)
                        switch (this._scope.experiment.usageScenario.value) {
                            case 'pipelineFromReads':
                                {
                                    if (this._scope.readsUploader)
                                        this._scope.usageError =
                                            this._scope.usageError ||
                                            !this._scope.readsUploader.atLeastSingleFileUploaded;

                                } break;
                            case 'pipelineFromSimulatedReads':
                                {

                                } break;
                            case 'classificationFromEnsemble':
                                {
                                    if (this._scope.ensembleUploader) {
                                        {
                                            this._scope.usageError =
                                                !this._scope.ensembleUploader.atLeastSingleFileUploaded;
                                            console.log(this._scope.ensembleUploader);
                                            console.log('at least', this._scope.ensembleUploader.atLeastSingleFileUploaded);
                                        }
                                    }
                                } break;
                        }
                });

            this._scope.$watchGroup(
                [
                    'emailError',
                    'usageError'
                ],
                (newVal: any, oldVal: any, scope: ng.IScope) => {
                    this._scope.formError =
                        this._scope.usageError ||
                        this._scope.emailError;
                });

            this._scope.$watchGroup(
                [
                    'inputForm.form.emailid.$error.required',
                    'inputForm.form.emailid.$invalid',
                    'inputForm.form.emailid.$pristine'
                ]
                ,
                (newVal: any, oldVal: any, scope: ng.IScope) => {
                    this._scope.emailError = false;
                    if (this._scope.inputForm.form)
                        this._scope.emailError =
                            (this._scope.inputForm.form.emailid.$error.required ||
                                this._scope.inputForm.form.emailid.$invalid)
                            && !this._scope.inputForm.form.emailid.$pristine;
                }
            );
        }

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
            if (this._scope.supportedAlgorithms)
                return this._scope.supportedAlgorithms.filter(function (alg: any) {
                    return alg.used;
                });
            else return [];
        }

        private getUsageScenarioOrReturn = (otherwise: IUsageScenario): IUsageScenario => {
            for (const usage of this.usageScenarios)
                if (usage.value === this._scope.experiment.usageScenario.value)
                    return usage;
            return otherwise;
        }


    }

    interface OnSuccessCBType {
        (fileItem: any, response: any, status: any, headers: any): void;
    }
    interface OnAfterAddingFileCBType {
        (fileItem: any): void;
    }


    interface UploaderControllerScope extends InputControllerScope {
        uploader: any,
        experiment: any
    }
    abstract class UploaderController {
        protected _scope: UploaderControllerScope;
        protected _uploader: any;
        protected _inputScope: InputControllerScope;
        protected abstract onSuccessItemCB: OnSuccessCBType;

        protected abstract onAfterAddingFileCB: OnAfterAddingFileCBType;

        constructor($scope: ng.IScope, FileUploaderService: any) {
            this._scope = <UploaderControllerScope>$scope;
            this._inputScope = <any>$scope.$parent.$parent.$parent;
        }
    }

    export class ReadsUploaderController extends UploaderController {
        static readonly $inject = ['$scope', 'FileUploaderService', ReadsUploaderController];

        constructor($scope: UploaderControllerScope, FileUploaderService: any) {
            super($scope, FileUploaderService);
            this._uploader = FileUploaderService.getFileUploader(
                'upload/reads', 'Drop reads file here', 'External dataset uploader');
            this._uploader.onSuccessItem = this.onSuccessItemCB;
            this._uploader.onAfterAddingFile = this.onAfterAddingFileCB;
            this._inputScope.readsUploader = this._uploader;
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


    export class EnsembleUploaderController extends UploaderController {
        static readonly $inject = ['$scope', 'FileUploaderService', EnsembleUploaderController];

        constructor($scope: UploaderControllerScope, FileUploaderService: any) {
            super($scope, FileUploaderService);
            this._uploader = FileUploaderService.getFileUploader(
                'upload/ensemble', 'Drop ensemble file here', 'Ensemble file uploader');
            this._uploader.onSuccessItem = this.onSuccessItemCB;
            this._uploader.onAfterAddingFile = this.onAfterAddingFileCB;
            this._inputScope.ensembleUploader = this._uploader;
            this._scope.uploader = this._uploader;
        };

        protected onSuccessItemCB = (fileItem: any, response: any, status: any, header: any) => {
            // console.info('onSuccessItem', fileItem, response, status, headers);
            console.log('success', response, header);
            this._scope.experiment.ensemble.uri =
                JSON.parse(JSON.stringify(header.filename));
            this._scope.experiment.ensemble.count =
                parseInt(header.ensemblecount, 10);
        };

        protected onAfterAddingFileCB = (fileItem: any) => {
            console.info('onAfterAddingFile', fileItem);

            this._scope.uploader.queue = [fileItem];

            this._scope.experiment.ensemble.name =
                JSON.parse(JSON.stringify(fileItem.file.name));
            this._scope.experiment.ensemble.size =
                JSON.parse(JSON.stringify(fileItem.file.size));

            setTimeout(function () {
                $("[data-toggle='tooltip']").tooltip({
                    trigger: 'hover'
                });
            }, 500);
        };
    }

    interface HeaderControllerScope extends ng.IScope {
        loggedIn: boolean,
        username: string,
        loginDialog: ng.dialog.IDialogOpenResult,
        registerDialog: ng.dialog.IDialogOpenResult,
        isState: (state: any) => boolean;
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
        username: string;
        password: string;
    }
    interface LoginControllerScope extends ng.IScope {
        rememberMe: boolean;
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

            this._scope.loginData = this._localStorage.getObject('userinfo');
            this._scope.doLogin = () => {
                if (this._scope.rememberMe)
                    this._localStorage.storeObject('userinfo', {
                        username: this._scope.loginData.username,
                        password: this._scope.loginData.password
                    });

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
        username: string,
        password: string,
        email: string,
        firstname: string,
        lastname: string,
        rememberMr: boolean
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

    interface ExperimentsListControllerScope extends ng.IScope {
        experiments: any,
        showExperiments: boolean,
        experimentsError: boolean,
        experimentsMessage: string
    }

    export class ExperimentsListController {
        static readonly $inject = ['$scope', 'ExperimentService', ExperimentsListController];
        private _scope: ExperimentsListControllerScope;

        constructor($scope: ng.IScope, private ExperimentService: any) {
            this._scope = <ExperimentsListControllerScope>$scope;
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

    interface IExperimentScope extends ng.IScope {
        user: string;
        isPrivate: boolean;
        email: string;
        description: string;
        config: common.IConfig;
        results: metaviz.IResults;
        createdAt: Date;
        showExperiment: boolean,
        experimentError: boolean,
        experimentMessage: string
    }

    export class ExperimentController {
        static readonly $inject = ['$scope', 'ExperimentService', 'AuthService', '$stateParams', '$timeout', ExperimentController];
        private _scope: IExperimentScope;
        private _auth: AuthFactory;
        private _timeout: ng.ITimeoutService;
        constructor($scope: ng.IScope, private ExperimentService: any, auth: AuthFactory, $stateParams: ng.ui.IStateParamsService) {
            this._scope = <IExperimentScope>$scope;
            this._auth = auth;
            this._scope.user = auth.getUsername();
            this._scope.showExperiment = false;
            this._scope.experimentError = false;
            this._scope.experimentMessage = "Loading ...";

            ExperimentService.getExperiment($stateParams.expId, this.onExperimentLoadedSuccess, this.onExperimentLoadedFail);

        }

        private onExperimentLoadedSuccess = (response: any) => {
            this._scope.user = response.user;
            this._scope.email = response.email;
            this._scope.description = response.description;
            this._scope.createdAt = response.createdAt;
            this._scope.isPrivate = false;
            this._scope.config = response.config;
            this._scope.results = {
                wevoteClassification: response.results.wevoteClassification.patch,
                numToolsUsed: response.results.wevoteClassification.numToolsUsed,
                abundance: response.results.taxonomyAbundanceProfile.abundance,
                statistics: { readsCount: 0, nonAbsoluteAgreement: 0 }
            };
            this._scope.showExperiment = true;
            this._scope.experimentError = false;
            this._scope.experimentMessage = '';
        };

        private onExperimentLoadedFail = (response: any) => {
            this._scope.experimentError = true;
            this._scope.experimentMessage = response;
        };
    }


    wevoteApp
        .controller('MainController', MainController.$inject)
        .controller('InputController', InputController.$inject)
        .controller('ReadsUploaderController', ReadsUploaderController.$inject)
        .controller('EnsembleUploaderController', EnsembleUploaderController.$inject)
        .controller('HeaderController', HeaderController.$inject)
        .controller('LoginController', LoginController.$inject)
        .controller('RegisterController', RegisterController.$inject)
        .controller('ExperimentsListController', ExperimentsListController.$inject)
        .controller('ExperimentController', ExperimentController.$inject)
        ;
}