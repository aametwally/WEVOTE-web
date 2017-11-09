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

        static readonly $inject = ['$resource', '$http', 'LocalStorageService', '$rootScope', '$window', '__env', 'ngDialog', AuthFactory.factory()];
        private static readonly TOKEN_KEY: string = 'Token';
        private _isAuthenticated: boolean = false;
        private _credentials: ICredentials;
        private _resource: ng.resource.IResourceService;
        private _http: ng.IHttpService;
        private _localStorage: LocalStorageFactory;
        private _rootScope: ng.IRootScopeService;
        private _window: ng.IWindowService;
        private _ngDialog: ng.dialog.IDialogService;

        constructor(
            $resource: ng.resource.IResourceService,
            $http: ng.IHttpService,
            $localStorage: LocalStorageFactory,
            $rootScope: ng.IRootScopeService,
            $window: ng.IWindowService,
            readonly __env: any,
            ngDialog: ng.dialog.IDialogService
        ) {
            this._resource = $resource;
            this._http = $http;
            this._localStorage = $localStorage;
            this._rootScope = $rootScope;
            this._window = $window;
            this.__env = __env;
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
                __env: any,
                ngDialog: ng.dialog.IDialogService) =>
                new AuthFactory($resource, $http, $localStorage, $rootScope, $window, __env, ngDialog);
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
            this._resource(this.__env.baseUrl + "users/login")
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
            this._resource(this.__env.baseUrl + "users/logout")
                .get((response: any) => { });
            this.destroyUserCredentials();
        };

        public register = (registerData: any, callbackSuccess?: any, callbackFail?: any) => {

            this._resource(this.__env.baseUrl + "users/register")
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
            uploader.uploaded = false;
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
            uploader.onCompleteAll =  () => {
                console.info('onCompleteAll');
                uploader.uploaded = true;
            };

            return uploader;
        }
    }

    abstract class DataRetriever {
        protected _resource: ng.resource.IResourceService;

        constructor(protected readonly __env: any, private $resource: ng.resource.IResourceService) {
            this._resource = $resource;
        }

        public abstract retrieve: (cbS: Function, cbF: Function) => any;
    }

    export class AlgorithmsFactory extends DataRetriever {
        static readonly $inject = ['__env', '$resource', AlgorithmsFactory.factory()];

        static factory() {
            let instance = (__env:any , $resource: ng.resource.IResourceService) =>
                new AlgorithmsFactory(__env, $resource);
            return instance;
        }

        public retrieve = (cbS: Function, cbF: Function) => {
            return this._resource(this.__env.baseUrl + "algorithm", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS, cbF);
        }
    }

    export class ExperimentFactory extends DataRetriever {
        static readonly $inject = ['__env', '$resource', ExperimentFactory.factory()];

        static factory() {
            let instance = (__env: any, $resource: ng.resource.IResourceService) =>
                new ExperimentFactory(__env, $resource);
            return instance;
        }

        public submit(formdata: any, cbS?: Function, cbF?: Function): any {
            return this._resource(this.__env.baseUrl + "experiment")
                .save({},
                formdata,
                () => {
                    if (cbS) cbS();
                    console.log('experiment submitted!');
                },
                () => {
                    if (cbF) cbF();
                    console.log('experiment not submitted!');
                });
        }

        public retrieve = (cbS: Function, cbF: Function) => {
            return this._resource(this.__env.baseUrl + "experiment", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS, cbF);
        }

        public getExperiment = (id: string, cbS: Function, cbF: Function) => {
            return this._resource(this.__env.baseUrl + 'experiment/:expId',
                { expId: id }, {
                    'update': {
                        method: 'PUT'
                    }
                }).get(cbS, cbF);
        }

        public removeExperiment = (id: string, cbS: Function, cbF: Function) => {
            return this._resource(this.__env.baseUrl + 'experiment/:expId',
                { expId: id }).remove(cbS, cbF);
        }
    }

    export class UserFactory extends DataRetriever {
        static readonly $inject = ['__env', '$resource', UserFactory.factory()];

        static factory() {
            let instance = (__env: any, $resource: ng.resource.IResourceService) =>
                new UserFactory(__env, $resource);
            return instance;
        }

        public register = (data: any, cbS: Function, cbF: Function) => {
            return this._resource(this.__env.baseUrl + "users/register")
                .save({}, data, cbS, cbF);
        }

        public login = (data: any, cbS: Function, cbF: Function) => {
            return this._resource(this.__env.baseUrl + "users/login")
                .save({}, data, cbS, cbF);
        }

        public retrieve = (cbS: Function, cbF: Function) => {
            return this._resource(this.__env.baseUrl + "users", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS, cbF);
        }
    }

    wevoteApp
        .factory('LocalStorageService', LocalStorageFactory.$inject)
        .factory('AuthService', AuthFactory.$inject)
        .factory('FileUploaderService', FileUploaderFactory.$inject)
        .factory('AlgorithmsService', AlgorithmsFactory.$inject)
        .factory('ExperimentService', ExperimentFactory.$inject)
        .factory('UserService', UserFactory.$inject)
        ;
}

