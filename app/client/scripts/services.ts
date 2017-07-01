/**
 * Created by asem on 06/06/17.
 */
"use strict";
module wevote
{
    export class FileUploaderFactory {

        static readonly $inject = ['FileUploader'];

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
        static readonly $inject = ['baseURL', '$resource'];
        protected _baseURL: string;
        protected _resource: ng.resource.IResourceService;

        constructor(private baseURL: string, private $resource: ng.resource.IResourceService) {
            this._baseURL = baseURL;
            this._resource = $resource;
        }

        public abstract retrieve: (cbS:Function , cbF: Function) => any;
    }

    export class SimulatedReadsFactory extends DataRetriever {
        static factory() {
            let instance = (baseURL: string, $resource: ng.resource.IResourceService) =>
                new SimulatedReadsFactory(baseURL, $resource);
            return instance;
        }

        public retrieve = (cbS:Function , cbF: Function) => {
            console.log("retrieving simulated reads");
            return this._resource(this._baseURL + "reads", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS,cbF);
        }
    }

    export class AlgorithmsFactory extends DataRetriever {
        static factory() {
            let instance = (baseURL: string, $resource: ng.resource.IResourceService) =>
                new AlgorithmsFactory(baseURL, $resource);
            return instance;
        }

        public retrieve = (cbS:Function , cbF: Function) => {
            return this._resource(this._baseURL + "algorithm", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS,cbF);
        }
    }

    export class ExperimentFactory extends DataRetriever {
        static factory() {
            let instance = (baseURL: string, $resource: ng.resource.IResourceService) =>
                new ExperimentFactory(baseURL, $resource);
            return instance;
        }

        public submit(formdata: any): any {

            return this._resource(this._baseURL + "experiment").save({}, formdata);
        }

        public retrieve = (cbS:Function , cbF: Function) => {
            return this._resource(this._baseURL + "experiment", null, {
                'update': {
                    method: 'PUT'
                }
            }).query(cbS,cbF);
        }
    }

    wevoteApp
        .constant("baseURL", "http://localhost:3001/")
        .factory('FileUploaderService', FileUploaderFactory.factory())
        .factory('SimulatedReadsService', SimulatedReadsFactory.factory())
        .factory('AlgorithmsService', AlgorithmsFactory.factory())
        .factory('ExperimentService', ExperimentFactory.factory())
}