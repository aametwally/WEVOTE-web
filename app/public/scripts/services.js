/**
 * Created by asem on 06/06/17.
 */
'use strict';


angular

    .module('wevoteApp')

    .constant("baseURL", "http://localhost:3000/")

    .factory('fileUploaderFactory', ['FileUploader', function (FileUploader) {
        var fileUploaderFactory = {};

        fileUploaderFactory.getFileUploader = function (url, label, description, multipleFileUploader) {
            multipleFileUploader = (multipleFileUploader !== undefined) ? multipleFileUploader : true;
            var uploader = new FileUploader({
                url: url
            });

            uploader.label = label;
            uploader.description = description;
            uploader.atLeastSingleFileUploaded = false;
            // FILTERS

            uploader.filters.push({
                name: 'customFilter',
                fn: function (item /*{File|FileLikeObject}*/ , options) {
                    return this.queue.length < 10;
                }
            });

            // CALLBACKS
            uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/ , filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };
            uploader.onAfterAddingFile = function (fileItem) {
                console.info('onAfterAddingFile', fileItem);
                if (!multipleFileUploader) {
                    this.queue = [fileItem];
                }
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
            uploader.onSuccessItem = function (fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
            };
            uploader.onErrorItem = function (fileItem, response, status, headers) {
                console.info('onErrorItem', fileItem, response, status, headers);
            };
            uploader.onCancelItem = function (fileItem, response, status, headers) {
                console.info('onCancelItem', fileItem, response, status, headers);
            };
            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                console.info('onCompleteItem', fileItem, response, status, headers);
                this.atLeastSingleFileUploaded = true;
            };
            uploader.onCompleteAll = function () {
                console.info('onCompleteAll');
                this.atLeastSingleFileUploaded = true;
            };

            console.info('uploader', uploader);

            return uploader;
        };

        return fileUploaderFactory;
    }])

    .factory('availableDatabaseFactory', ['baseURL', '$resource', function (baseURL, $resource) {
        var availableDatabaseFac = {};
        availableDatabaseFac.getAvailableDatabase = function () {
            return $resource(baseURL + "reads", null, {
                'update': {
                    method: 'PUT'
                }
            });
        };
        return availableDatabaseFac;
    }])

    .factory('algorithmsFactory', ['baseURL', '$resource', function (baseURL, $resource) {
        var supportedAlgorithmsFac = {};
        supportedAlgorithmsFac.getSupportedAlgorithms = function () {
            return $resource(baseURL + "algorithm", null, {
                'update': {
                    method: 'PUT'
                }
            });
        };
        return supportedAlgorithmsFac;
    }])

    .factory('experimentFactory', ['baseURL', '$resource', function (baseURL, $resource) {
        var experimentFac = {};
        experimentFac.submit = function (formdata) {
            return $resource(baseURL + "experiment").save({},formdata);
        };
        return experimentFac;
    }])

;