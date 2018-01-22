/**
 * Created by asem on 06/06/17.
 */
"use strict";
module wevote {

    interface HeaderControllerScope extends ng.IScope {
        loggedIn: boolean,
        username: string,
        isState: (state: any) => boolean;
        logOut: () => void;
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
                return this._state.is(state);
            }

            this._scope.logOut = () => {
                this._auth.logout();
                this._scope.loggedIn = false;
                this._scope.username = '';
                this._state.go('app.login');
            }

            this._rootScope.$on('$locationChangeStart', (event) => {
                if (!this._auth.isAuthenticated()) {
                    if (!this._state.is('app.login') && !this._state.is('app.register')) {
                        event.preventDefault();
                        this._state.go('app.login');
                    }
                }
            });

            this._rootScope.$on('login:Successful', () => {
                this._scope.loggedIn = this._auth.isAuthenticated();
                this._scope.username = this._auth.getUsername();
                this._state.go('app');
            });

            this._rootScope.$on('registration:Successful', () => {
                this._scope.loggedIn = this._auth.isAuthenticated();
                this._scope.username = this._auth.getUsername();
                this._state.go('app');
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
                    () => {
                        this._ngDialog.closeAll();
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
                    () => {
                        this._ngDialog.closeAll();
                    });
            };
        }
    }


    interface MainControllerScope extends ng.IScope {
        showInput: boolean,
        error: boolean,
        message: string,
    }

    export class MainController {
        static readonly $inject: any = ['$scope', '$state', 'HelloService', MainController];
        private _scope: MainControllerScope;
        private _hello: metaviz.HelloFactory;

        constructor($scope: ng.IScope, $state: ng.ui.IState, hello: metaviz.HelloFactory) {
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

    interface InputControllerScope extends ng.IScope {
        state: ng.ui.IStateService,
        availableDatabaseLoaded: boolean,
        supportedAlgorithmsLoaded: boolean,
        availableDatabase: any,
        showInput: boolean,
        areDataLoaded: any,
        error: boolean,
        message: string,
        usageError: boolean,
        usageErrorMessage: string,
        fileUploaded: boolean,
        selectiveAlgorithms: boolean,
        noAlgorithmChosen: boolean,
        supportedAlgorithms: any,
        experiment: common.IExperiment,
        inputForm: any,
        usageScenarios: IUsageScenario[],
        postExperiment: any,
        uploader: any
    }

    export class InputController {

        static readonly $inject = ['$rootScope', '$scope', '$state',
            'AlgorithmsService', 'ExperimentService', InputController];

        private readonly usageScenarios: IUsageScenario[] = [{
            value: "pipelineFromReads",
            usage: "Full Pipeline",
            hint: "upload reads file"
        },
        {
            value: "classificationFromEnsemble",
            usage: "Classification",
            hint: "upload a wevote ensemble file"
        },
        {
            value: "abundanceFromClassification",
            usage: "Community Profiling",
            hint: "upload wevote classified file"
        }
        ];

        private readonly emptyExperiment: common.IExperiment = {
            user: "public",
            email: "",
            description: "",
            usageScenario: this.usageScenarios[0],
            reads: {
                name: "",
                description: "",
                cdnUrl: "",
                uuid: "",
                data: "",
                size: 0,
                count: 0
            },
            config: {
                minScore: 0.1,
                minNumAgreed: 1,
                penalty: 2,
                algorithms: []
            }
        };

        private rootScope: InputControllerScope;

        constructor($rootScope: ng.IRootScopeService, $scope: any, $state: ng.ui.IStateService,
            private AlgorithmsService: any, private ExperimentService: any) {
            $scope.global = $rootScope;
            var root = <InputControllerScope>$rootScope;
            this.rootScope = <InputControllerScope>$rootScope;

            root.inputForm = {};
            root.state = $state;

            root.fileUploaded = false;
            root.usageError = false;

            root.usageScenarios = this.usageScenarios;

            root.selectiveAlgorithms = true;
            root.supportedAlgorithms = [];
            root.supportedAlgorithmsLoaded = false;
            root.areDataLoaded = this.areDataLoaded;
            AlgorithmsService.retrieve(this.onSupportedAlgorithmsSuccess, this.onSupportedAlgorithmsFail);
            root.experiment = JSON.parse(JSON.stringify(this.emptyExperiment));

            root.postExperiment = () => {
                if (root.fileUploaded) {
                    const noAlgorithmChosen = this.getUsedAlgorithms().length === 0;
                    root.usageError = root.experiment.usageScenario.value === 'pipelineFromReads' && noAlgorithmChosen;


                    if (!root.usageError) {
                        root.experiment.usageScenario = this.getUsageScenarioOrReturn(this.usageScenarios[0]);
                        root.experiment.config.algorithms = this.getUsedAlgorithms();
                        const email = `${root.experiment.email}`;
                        this.ExperimentService.submit(
                            root.experiment,
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
                                root.$on('$stateChangeStart', () => {
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
                                root.$on('$stateChangeStart', () => {
                                    $('#submission-message').empty();
                                });

                            });

                        $('#advanced').collapse("hide");
                    }
                }

            };

            // root.uploader = null;
            // Watchers!
            // this._scope.experiment.usageScenario.value;
            root.$watch('experiment.usageScenario.value', (usage: string) => {
                switch (usage) {
                    case 'pipelineFromReads': {
                        root.selectiveAlgorithms = true;
                    }
                        break;
                    case 'abundanceFromClassification': {
                        root.selectiveAlgorithms = false;
                    }
                        break;
                    case 'classificationFromEnsemble': {
                        root.selectiveAlgorithms = false;
                    }
                        break;
                }
            });
        }

        private areDataLoaded = () => {
            return this.rootScope.supportedAlgorithmsLoaded;
        };

        private onSupportedAlgorithmsSuccess: Function = (response: any) => {

            this.rootScope.supportedAlgorithms = response;
            this.rootScope.supportedAlgorithms.forEach(function (alg: any) {
                alg.used = true;
            });
            this.rootScope.supportedAlgorithmsLoaded = true;
            this.rootScope.showInput = this.rootScope.areDataLoaded();
            console.log(this.rootScope.showInput);
        }

        private onSupportedAlgorithmsFail: Function = (response: any) => {
            this.rootScope.error = true;
            this.rootScope.message = "Error: " + response.status + " " + response.statusText;
        }

        private getUsedAlgorithms = () => {
            if (this.rootScope.supportedAlgorithms)
                return this.rootScope.supportedAlgorithms.filter(function (alg: any) {
                    return alg.used;
                });
            else return [];
        }

        private getUsageScenarioOrReturn = (otherwise: IUsageScenario): IUsageScenario => {
            for (const usage of this.usageScenarios)
                if (usage.value === this.rootScope.experiment.usageScenario.value)
                    return usage;
            return otherwise;
        }


    }

    interface UploaderControllerScope extends InputControllerScope {
        uploadProgress: string,
    }

    export class UploaderController {
        static readonly $inject = ['$rootScope', '$scope', 'Upload', '__env', '$timeout', UploaderController];

        private rootScope: UploaderControllerScope;

        constructor($rootScope: ng.IRootScopeService, $scope: any, Upload: any, __env: any, $timeout: ng.ITimeoutService) {
            $scope.global = $rootScope;
            this.rootScope = <UploaderControllerScope>$rootScope;
            let root = <any>$rootScope;
            root.fileUploaded = false;
            root.uploadProgress = 0;

            $scope.$watch('file', function () {
                if (root.file != null) {
                    root.file = $scope.file;
                    root.upload(root.file);
                    root.fileUploaded = false;
                }
            });
            root.log = '';


            root.upload = (file: any) => {
                if (file) {
                    if (!file.$error) {
                        Upload.upload({
                            url: __env.baseUrl + 'upload/reads',
                            data: {
                                file: file
                            }
                        }).then((resp: any) => {
                            root.log = 'file: ' +
                                resp.config.data.file.name +
                                ', Response: ' + JSON.stringify(resp.data) +
                                '\n' + $scope.log;
                            root.fileUploaded = true;
                            root.experiment.reads.uuid =
                                JSON.parse(JSON.stringify(resp.data.filename));
                            root.experiment.reads.count =
                                parseInt(resp.data.readscount, 10);
                            console.log(resp);
                        }, null, (evt: any) => {
                            const progressPercentage = 100.0 * parseInt(evt.loaded) / parseInt(evt.total);
                            root.log = 'progress: ' + progressPercentage +
                                '% ' + evt.config.data.file.name + '\n' +
                                root.log;
                            root.uploadProgress = progressPercentage;
                            console.log(root.uploadProgress);
                        });
                    }
                }
            };
        };


    }

    interface ExperimentsListControllerScope extends ng.IScope {
        experiments: any,
        showExperiments: boolean,
        experimentsError: boolean,
        experimentsMessage: string
    }

    export class ExperimentsListController {
        static readonly $inject = ['$scope', 'ExperimentService', '$interval', ExperimentsListController];
        private _scope: ExperimentsListControllerScope;
        private static _experimentService: any;
        private static _refreshInterval: any;

        constructor($scope: ng.IScope, private ExperimentService: any, $interval: any) {
            this._scope = <ExperimentsListControllerScope>$scope;
            this._scope.experiments = {};
            this._scope.showExperiments = false;
            this._scope.experimentsError = false;
            this._scope.experimentsMessage = "Loading ...";
            ExperimentsListController._experimentService = ExperimentService;
            ExperimentsListController._experimentService.retrieve(this.onExperimentsLoadedSuccess, this.onExperimentsLoadedFail);
            ExperimentsListController._refreshInterval = $interval(() => {
                ExperimentsListController._experimentService.retrieve(this.onExperimentsLoadedSuccess, this.onExperimentsLoadedFail);
            }, 4000);
            this._scope.$on('$stateChangeStart', () => {
                $interval.cancel(ExperimentsListController._refreshInterval);
            });
        }

        private onExperimentsLoadedSuccess: Function = (response: any) => {
            this._scope.experiments = response;
            this._scope.showExperiments = true;
            setTimeout(() => {
                $("[data-toggle='tooltip']").tooltip({
                    trigger: 'hover',
                    placement: 'top'
                });

                this._scope.experiments.forEach((exp: any) => {
                    $('#' + exp._id).popover({
                        html: true,
                        trigger: "focus",
                        placement: "bottom",
                        content: function () {
                            return $('#data-' + exp._id).html();
                        }
                    });
                    $('#' + exp._id).click((e) => {
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

                    $('#' + 'remove-' + exp._id).click((e: any) => {
                        // Delete experiment.
                        ExperimentsListController._experimentService.removeExperiment(exp._id,
                            (delResponse: any) => {
                                console.log('experiment removed:', delResponse);
                                ExperimentsListController._experimentService.retrieve(this.onExperimentsLoadedSuccess, this.onExperimentsLoadedFail);
                            },
                            (delResponse: any) => {
                                console.log('experiment failed to remove:', delResponse);
                            })
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
        .controller('UploaderController', UploaderController.$inject)
        .controller('HeaderController', HeaderController.$inject)
        .controller('LoginController', LoginController.$inject)
        .controller('RegisterController', RegisterController.$inject)
        .controller('ExperimentsListController', ExperimentsListController.$inject)
        .controller('ExperimentController', ExperimentController.$inject)
        ;
}