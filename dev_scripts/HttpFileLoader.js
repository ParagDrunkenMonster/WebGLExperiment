'use strict';

if (SmartVizXFramework === undefined)
  var SmartVizXFramework = {};

SmartVizXFramework.HttpFileLoader = function(_fileURL, _onLoaded, _onError, _fileType, _userData)   {

    var fileURL = _fileURL;
    var currFileType = _fileType;
    var onFileLoaded = _onLoaded;
    var onLoadError = _onError;
    var userData = _userData;

    var XMLHttpState = {
        REQUEST_NOT_INITIALIZED: 0,
        SERVER_CONNECTION_ESTABLISHED: 1,
        REQUEST_RECEIVED: 2,
        PROCESSING_REQUEST: 3,
        REQUEST_FINISHED_AND_RESPONSE_IS_READY: 4,
        OK: 200,
        PAGE_NOT_FOUND: 404
    };

    var scope = this;

    (function() {
        _fileURL = undefined;
        _fileType = undefined;
        _onLoaded = undefined;
        _onError = undefined;
        _userData = undefined;
    })();

    // *****************************************************************************************************
    // Public functions
    // *****************************************************************************************************
    scope.loadFile = function()   {
        if ((scope.request == undefined || scope.request == null ) && document.implementation && document.implementation.createDocument) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if (request.readyState === XMLHttpState.REQUEST_FINISHED_AND_RESPONSE_IS_READY) {
                    if (request.status === XMLHttpState.REQUEST_NOT_INITIALIZED || request.status === XMLHttpState.OK) {
                        if (request.response) {
                            if (currFileType == SmartVizXFramework.HttpFileLoader.FileType.XML) {
                                if (request.responseXML)    {
                                    onFileLoaded(request.responseXML, userData);
                                    scope.destroy();
                                } else {
                                    onLoadError('HttpFileLoader: Invalid XML (' + fileURL + ')', userData);
                                    scope.destroy();
                                }
                            } else {
                                onFileLoaded(request.response, userData);
                                scope.destroy();
                            }
                        } else {
                            onLoadError('HttpFileLoader: Empty or non-existing file (' + fileURL + ')', userData);
                            scope.destroy();
                        }
                    }
                } else if (request.readyState === XMLHttpState.PROCESSING_REQUEST) {
                    //console.log('Loading file ' + fileURL + ' in progress...');
                }
                else if (request.readyState === XMLHttpState.PAGE_NOT_FOUND)    {
                    var fileURLLocal = fileURL;
                    if (fileURLLocal)
                        onLoadError('HttpFileLoader: Non-existing file (' + fileURLLocal + ')', userData);
                    scope.destroy();
                }

                if (request.status === XMLHttpState.PAGE_NOT_FOUND) {
                    var fileURLLocal = fileURL;
                    if (fileURLLocal)
                        onLoadError('HttpFileLoader: Empty or non-existing file (' + fileURLLocal + ')', userData);
                    scope.destroy();
                }
            };

            request.addEventListener("error", function(e)
            {
                onLoadError('HttpFileLoader: Empty or non-existing file (' + fileURL + ')', userData);
                scope.destroy();
            });

            request.open("GET", fileURL, true);
            if (currFileType == SmartVizXFramework.HttpFileLoader.FileType.BINARY)  {
                request.responseType = 'arraybuffer';
            }
            else if (currFileType == SmartVizXFramework.HttpFileLoader.FileType.XML) {
                request.overrideMimeType('text/xml');
            }
            request.send(null);
        } else {
            onLoadError("Don't know how to parse XML!", userData);
        }
    }

    scope.destroy = function()  {
        fileURL = null;
        currFileType = null;
        onFileLoaded = null;
        onLoadError = null;
        userData = null;
    }

    // *****************************************************************************************************
    // Private functions
    // *****************************************************************************************************
};

SmartVizXFramework.HttpFileLoader.FileType = {
    BINARY : 0,
    XML : 1,
}
