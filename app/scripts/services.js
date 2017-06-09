/**
 * Created by asem on 06/06/17.
 */
'use strict';


angular

    .module('wevoteApp')

    .factory('fileUploaderFactory', ['FileUploader', function (FileUploader) {
        var fileUploaderFactory = {};

        fileUploaderFactory.getFileUploader = function (url, label, description, multipleFileUploader) {
            multipleFileUploader = (multipleFileUploader !== undefined) ? multipleFileUploader : true;
            var uploader = new FileUploader({
                url: url
            });

            uploader.label = label;
            uploader.description = description;

            // FILTERS

            uploader.filters.push({
                name: 'customFilter',
                fn: function (item /*{File|FileLikeObject}*/, options) {
                    return this.queue.length < 10;
                }
            });

            // CALLBACKS

            uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
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
            };
            uploader.onCompleteAll = function () {
                console.info('onCompleteAll');
            };

            console.info('uploader', uploader);

            return uploader;
        };

        return fileUploaderFactory;
    }])

    .factory('availableDatabaseFactory', [function () {
        var availableDatabaseFac = {};
        var data = [
            {
                _id: 0,
                name: 'HiSeq',
                size: '2333'
            },
            {
                _id: 1,
                name: 'MiSeq',
                size: '2333'
            },
            {
                _id: 2,
                name: 'simBA5',
                size: '2333'
            },
            {
                _id: 3,
                name: 'simHC20',
                size: '2333'
            },
            {
                _id: 4,
                name: 'HC1',
                size: '2333'
            },
            {
                _id: 5,
                name: 'HC2',
                size: '2333'
            },
            {
                _id: 6,
                name: 'LC1',
                size: '2333'
            },
            {
                _id: 7,
                name: 'LC2',
                size: '2333'
            },
            {
                _id: 8,
                name: 'LC3',
                size: '2333'
            },
            {
                _id: 9,
                name: 'LC4',
                size: '2333'
            }

        ];
        availableDatabaseFac.getAvailableDatabase = function () {
            return data;
        };

        return availableDatabaseFac;
    }])

    .factory('algorithmsFactory', [function () {
        var supportedAlgorithmsFac = {};
        var supportedAlgorithms = [
            {
                name: 'Kraken'
            },
            {
                name: 'BLASTN'
            },
            {
                name: 'TIPP'
            },
            {
                name: 'CLARK'
            },
            {
                name: 'MetaPhlAn'
            }
        ];

        supportedAlgorithmsFac.getSupportedAlgorithms = function(){
            return supportedAlgorithms;
        };

        return supportedAlgorithmsFac;
    }]);

;