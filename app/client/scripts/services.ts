/**
 * Created by asem on 06/06/17.
 */
"use strict";
module wevote {

    export class LocalStorageFactory {
        static readonly $inject = ['$window', LocalStorageFactory.factory()];

        private _window: ng.IWindowService;

        constructor(private $window: ng.IWindowService) {
            this._window = window;
        }

        static factory() {
            let instance = ($window: ng.IWindowService) =>
                new LocalStorageFactory($window);
            return instance;
        }

        public store = (key: string, value: string) => {
            this._window.localStorage[key] = value;
        }

        public get = (key: string, defaultValue: string) => {
            return this._window.localStorage[key] || defaultValue;
        }

        public remove = (key: string) => {
            this._window.localStorage.removeItem(key);
        }

        public storeObject = (key: string, value: Object) => {
            this._window.localStorage[key] = JSON.stringify(value);
        }

        public getObject = (key: string, defaultValue: string = '{}') => {
            return JSON.parse(this._window.localStorage[key] || defaultValue);
        }
    }


    interface ICredentials {
        username: string,
        authToken: string
    }
    export class AuthFactory {

        static readonly $inject = ['$resource', '$http', 'LocalStorageService', '$rootScope', '$window', 'baseURL', 'ngDialog', AuthFactory.factory()];
        private static readonly TOKEN_KEY: string = 'Token';
        private _isAuthenticated: Boolean = false;
        private _credentials: ICredentials;
        private _resource: ng.resource.IResourceService;
        private _http: ng.IHttpService;
        private _localStorage: LocalStorageFactory;
        private _rootScope: ng.IRootScopeService;
        private _window: ng.IWindowService;
        private readonly _baseURL: string;
        private _ngDialog: ng.dialog.IDialogService;

        constructor(
            $resource: ng.resource.IResourceService,
            $http: ng.IHttpService,
            $localStorage: LocalStorageFactory,
            $rootScope: ng.IRootScopeService,
            $window: ng.IWindowService,
            readonly baseURL: string,
            ngDialog: ng.dialog.IDialogService
        ) {
            this._resource = $resource;
            this._http = $http;
            this._localStorage = $localStorage;
            this._rootScope = $rootScope;
            this._window = $window;
            this._baseURL = baseURL;
            this._ngDialog = ngDialog;
            this._credentials = { username: '', authToken: '' };
            this.loadUserCredentials();
        }
        static factory() {
            let instance = ($resource: ng.resource.IResourceService,
                $http: ng.IHttpService,
                $localStorage: LocalStorageFactory,
                $rootScope: ng.IRootScopeService,
                $window: ng.IWindowService,
                baseURL: string,
                ngDialog: ng.dialog.IDialogService) =>
                new AuthFactory($resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog);
            return instance;
        }

        private loadUserCredentials = () => {
            let credentials = this._localStorage.getObject(AuthFactory.TOKEN_KEY, '{}');
            if (credentials.username != undefined) {
                this.useCredentials(credentials);
            }
        }

        private storeUserCredentials = (credentials: any) => {
            this._localStorage.storeObject(AuthFactory.TOKEN_KEY, credentials);
            this.useCredentials(credentials);
        }

        private useCredentials = (credentials: ICredentials) => {
            this._isAuthenticated = true;
            this._credentials = credentials;

            // Set the token as header for your requests!
            let headers = <any>this._http.defaults.headers;
            headers.common['x-access-token'] = this._credentials.authToken;
        }

        private destroyUserCredentials = () => {
            this._credentials = { username: '', authToken: '' };
            this._isAuthenticated = false;
            let headers = <any>this._http.defaults.headers;
            headers.common['x-access-token'] = this._credentials.authToken;
            this._localStorage.remove(AuthFactory.TOKEN_KEY);
        }

        public login = (loginData: any, callbackSuccess?: any, callbackFail?: any) => {
            this._resource(this.baseURL + "users/login")
                .save(loginData,
                (response: any) => {
                    this.storeUserCredentials({
                        username: loginData.username,
                        authToken: response.token
                    });
                    this._rootScope.$broadcast('login:Successful');
                    if (callbackSuccess) callbackSuccess();
                },
                (response: any) => {
                    this._isAuthenticated = false;
                    const message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                        '<div><p>' + response.data.err.message + '</p><p>' +
                        response.data.err.name + '</p></div>' +
                        '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>'

                    this._ngDialog.openConfirm(<any>{ template: message, plain: 'true' });
                    if (callbackFail) callbackFail();
                }

                );
        };

        public logout = () => {
            this._resource(this.baseURL + "users/logout")
                .get((response: any) => { });
            this.destroyUserCredentials();
        };

        public register = (registerData: any, callbackSuccess?: any, callbackFail?: any) => {

            this._resource(this.baseURL + "users/register")
                .save(registerData,
                (response: any) => {
                    this.login({
                        username: registerData.username,
                        password: registerData.password
                    });
                    if (registerData.rememberMe) {
                        this._localStorage.storeObject('userinfo',
                            {
                                username: registerData.username,
                                password: registerData.password
                            });
                    }

                    this._rootScope.$broadcast('registration:Successful');
                    if (callbackSuccess) callbackSuccess();
                },
                (response: any) => {

                    const message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                        '<div><p>' + response.data.err.message +
                        '</p><p>' + response.data.err.name + '</p></div>' +
                        '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>'
                    this._ngDialog.openConfirm(<any>{
                        template: message,
                        plain: 'true',
                        showClose: false
                    });
                    if (callbackFail) callbackFail();
                });
        };

        public isAuthenticated = () => {
            return this._isAuthenticated;
        };

        public getUsername = () => {
            return this._credentials.username;
        };
    }

    export class FileUploaderFactory {

        static readonly $inject = ['FileUploader', FileUploaderFactory.factory()];

        private _FileUploader: any;

        constructor(private FileUploader: any) {
            this._FileUploader = FileUploader;
        }

        static factory() {
            let instance = (FileUploader: any) => new FileUploaderFactory(FileUploader);
            return instance;
        }

        public getFileUploader(url: string, label: string, description: string): any {
            let uploader = new this.FileUploader({
                url: url
            });

            uploader.label = label;
            uploader.description = description;
            uploader.atLeastSingleFileUploaded = false;
            // FILTERS

            uploader.filters.push({
                name: 'customFilter',
                fn: function (item: any /*{File|FileLikeObject}*/, options: any) {
                    return this.queue.length < 10;
                }
            });

            // CALLBACKS
            uploader.onWhenAddingFileFailed = function (item: any /*{File|FileLikeObject}*/, filter: any, options: any) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };

            uploader.onAfterAddingAll = function (addedFileItems: any) {
                console.info('onAfterAddingAll', addedFileItems);
            };
            uploader.onBeforeUploadItem = function (item: any) {
                console.info('onBeforeUploadItem', item);
            };
            uploader.onProgressItem = function (fileItem: any, progress: any) {
                console.info('onProgressItem', fileItem, progress);
            };
            uploader.onProgressAll = function (progress: any) {
                console.info('onProgressAll', progress);
            };

            uploader.onErrorItem = function (fileItem: any, response: any, status: any, headers: any) {
                console.info('onErrorItem', fileItem, response, status, headers);
            };
            uploader.onCancelItem = function (fileItem: any, response: any, status: any, headers: any) {
                console.info('onCancelItem', fileItem, response, status, headers);
            };
            uploader.onCompleteItem = function (fileItem: any, response: any, status: any, headers: any) {
                // console.info('onCompleteItem', fileItem, response, status, headers);
                // console.log(headers);
                this.atLeastSingleFileUploaded = true;
            };
            uploader.onCompleteAll = function () {
                console.info('onCompleteAll');
                this.atLeastSingleFileUploaded = true;
            };

            return uploader;
        }
    }

    abstract class DataRetriever {
        protected _baseURL: string;
        protected _resource: ng.resource.IResourceService;

        constructor(private baseURL: string, private $resource: ng.resource.IResourceService) {
            this._baseURL = baseURL;
            this._resource = $resource;
        }

        public abstract retrieve: (cbS: Function, cbF: Function) => any;
    }

    export class SimulatedReadsFactory extends DataRetriever {
        static readonly $inject = ['baseURL', '$resource', SimulatedReadsFactory.factory()];

        static factory() {
            let instance = (baseURL: string, $resource: ng.resource.IResourceService) =>
                new SimulatedReadsFactory(baseURL, $resource);
            return instance;
        }

        public retrieve = (cbS: Function, cbF: Function) => {
            console.log("retrieving simulated reads");
            return this._resource(this._baseURL + "reads", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS, cbF);
        }
    }

    export class AlgorithmsFactory extends DataRetriever {
        static readonly $inject = ['baseURL', '$resource', AlgorithmsFactory.factory()];

        static factory() {
            let instance = (baseURL: string, $resource: ng.resource.IResourceService) =>
                new AlgorithmsFactory(baseURL, $resource);
            return instance;
        }

        public retrieve = (cbS: Function, cbF: Function) => {
            return this._resource(this._baseURL + "algorithm", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS, cbF);
        }
    }

    export class ExperimentFactory extends DataRetriever {
        static readonly $inject = ['baseURL', '$resource', ExperimentFactory.factory()];

        static factory() {
            let instance = (baseURL: string, $resource: ng.resource.IResourceService) =>
                new ExperimentFactory(baseURL, $resource);
            return instance;
        }

        public submit(formdata: any): any {
            return this._resource(this._baseURL + "experiment")
                .save({}, formdata);
        }

        public retrieve = (cbS: Function, cbF: Function) => {
            return this._resource(this._baseURL + "experiment", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS, cbF);
        }

        public getExperiment = (id: string, cbS: Function, cbF: Function) => {
            return this._resource(this._baseURL + 'experiment/:expId',
                { expId: id }, {
                    'update': {
                        method: 'PUT'
                    }
                }).get(cbS, cbF);
        }
    }

    export class UserFactory extends DataRetriever {
        static readonly $inject = ['baseURL', '$resource', UserFactory.factory()];

        static factory() {
            let instance = (baseURL: string, $resource: ng.resource.IResourceService) =>
                new UserFactory(baseURL, $resource);
            return instance;
        }

        public register = (data: any, cbS: Function, cbF: Function) => {
            return this._resource(this._baseURL + "users/register")
                .save({}, data, cbS, cbF);
        }

        public login = (data: any, cbS: Function, cbF: Function) => {
            return this._resource(this._baseURL + "users/login")
                .save({}, data, cbS, cbF);
        }

        public retrieve = (cbS: Function, cbF: Function) => {
            return this._resource(this._baseURL + "users", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS, cbF);
        }
    }

    wevoteApp
        .constant("baseURL", "http://localhost:3000/")
        .factory('LocalStorageService', LocalStorageFactory.$inject)
        .factory('AuthService', AuthFactory.$inject)
        .factory('FileUploaderService', FileUploaderFactory.$inject)
        .factory('SimulatedReadsService', SimulatedReadsFactory.$inject)
        .factory('AlgorithmsService', AlgorithmsFactory.$inject)
        .factory('ExperimentService', ExperimentFactory.$inject)
        .factory('UserService', UserFactory.$inject)
        ;
}