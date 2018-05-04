"user strict";

angular.module('ThubanApp')

.provider('Utils', function() {

    this.$get = ['$rootScope', '$state', '$cordovaFile', '$ionicHistory', '$q', function($rootScope, $state, $cordovaFile, $ionicHistory, $q) {
        /****************/
        /* PRIVATE METHODS
        /****************/
        var chosenObject = {};

        /**
        * Converts a base 64 file to a blob object
        * @param b64Data base64 stream
        * @param contentType String. Type of the file
        * @param sliceSize int. (optional) slices of bytes to convert the file (optional)
        * @returns Blob Object
        */
        function b64toBlob(b64Data, contentType, sliceSize) {
            contentType = contentType || '';
            sliceSize = sliceSize || 512;

            var byteCharacters = atob(b64Data);
            var byteArrays = [];

            for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                var slice = byteCharacters.slice(offset, offset + sliceSize);

                var byteNumbers = new Array(slice.length);
                for (var i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                var byteArray = new Uint8Array(byteNumbers);

                byteArrays.push(byteArray);
            }

            var blob = new Blob(byteArrays, {type: contentType});
            return blob;
        }

        /**
        * Cleans all cached views and sends the user to login page
        * @returns nothing
        */
        function goToLoginPage() {
            $ionicHistory.clearCache(['app.home', 'app.search', 'app.create', 'app.trays'])
            .then(function() {
                $ionicHistory.clearHistory();
                $rootScope.token = null;
                setGeneralVariables();

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });

                $state.go('login');
            })
            .catch(function(error) {
                console.error(error);
            });
        }

        /**
        * sets original values for all variables stated inside the rootScope
        * @returns nothing
        */
        function setGeneralVariables() {
            // esta variable sirve para quedarse en la misma pantalla en caso que devuelve un error de permisos la ejecución de una bandeja
            $rootScope.executreTrayDenied = false;

            // Estos parametros sirven la lista que se arma en items-list al cual se puede acceder desde una bandeja WF o desde la pantalla de búsqueda
            $rootScope.actualList = {
                params: {},
                classFields: {}
            };

            $rootScope.actualList.params = {
                documentClass: null,
                orCriteria: null,
                queryFields: [],
                searchCriterias: [],
                from: null,
                to: null,
                maxResults: 15,
                sortField: 'INDEX_ITEM_ID',
                sortDirection: 'ASC',
                isTray: false,
                trayType: 'WFTray',
                trayName: null,
                wfName: null,
                statusName: null
            };

            // Estos párametros sirven para la lista que se arma en trays-items-list al cual se puede acceder solo desde una bandeja de Thuban
            $rootScope.trayList = {
                params: {},
                trays: {}
            }

            $rootScope.trayList.params = {
                from: null,
                to: null,
                maxResults: 15,
                sortField: 'INDEX_ITEM_ID',
                sortDirection: 'ASC',
                trayType: 'ThubanTray',
                trayName: null
            }

            // En esta variable se guardan las notas del actual item visualizado
            $rootScope.actualItem = {
                docClass: null,
                notes: null
            };
        }

        /**
        * Get specific object inside n level of obejcts nested inside a father object
        * @param rootObject Object. The root of the nested obejcts, father
        * @param name String. The key name of the object to find
        * @param subOjectsKey String. The name of the key of the object with the nested objects
        * rootObject = {
        *     name: {
        *         key: value,
        *         ...
        *         subOjectsKey: {
        *             name: {},
        *             name: {}
        *         }
        *     },
        *     name: {}
        * }
        * @returns Object or null
        */
        function objectInNestedObjectsByName(rootObject, name, subOjectsKey) {
            var keys = [];

            for(var key in rootObject) {
                keys.push(key);
            }

            for (var i = 0; i < keys.length; i++) {
                if(name == keys[i]) {
                    chosenObject = rootObject[keys[i]];
                } else {
                    if(rootObject[keys[i]].hasOwnProperty(subOjectsKey)) {
                        if(!angular.equals(rootObject[keys[i]][subOjectsKey], {})) {
                            objectInNestedObjectsByName(rootObject[keys[i]][subOjectsKey], name, subOjectsKey);
                        }
                    }
                }
            }

            return chosenObject;
        }

        /**
        * Process an array of items, pushes objects in another array for select2 of the type { id: int, text: String },
        * and create a mapped object linking the id with the original object from the original array.
        * @param originalArray Array
        * @param optionsArray Array
        * @param mappedObject Object
        * @param firstTextValue String
        * @param secondTextValue String (optional)
        * @returns nothing. Changes the arrays and the object passed as parameters
        */
        function processObjectsArrayForSelectOptions(originalArray, optionsArray, mappedObject, firstTextValue, secondTextValue) {
            for (var i = 0; i < originalArray.length; i++) {
                if(firstTextValue == '' && secondTextValue == '') {
                    var option = {
                        id: originalArray[i],
                        text: originalArray[i]
                    }
                } else {
                    var option = {
                        id: i,
                        text: (originalArray[i][firstTextValue] == '') ? originalArray[i][secondTextValue] : originalArray[i][firstTextValue]
                    }

                    mappedObject[i] = originalArray[i];
                }

                optionsArray.push(option);
            }
        }

        /**
        * Gets the values of sql aux fields for multivalued fields
        * @param auxFields array
        * @returns array or message of error
        */
        function getMultivaluedFieldAuxFields() {
            return '';
        }

        /**
        * Open the android UI to choose a file from the phone files.
        * @returns object result.
        */
        function chooseFile(resource) {
            var deferred = $q.defer();

            fileChooser.open(
                function (contentUri) {
                    window.plugins.DocumentContract.getContract({
                        uri: contentUri,
                        columns: [
                            '_display_name',
                            '_size'
                        ]
                    }, function(contract) {
                        // tamaño en KB. Contract.size viene en Byte
                        resource.size = contract['_size']/1024;

                        window.plugins.DocumentContract.createFile({
                            uri: contentUri,
                            fileName: contract['_display_name'] || 'unknown'
                        }, function(fileName) {
                            resolveLocalFileSystemURL(cordova.file.dataDirectory + fileName, function(fileEntry) {
                                    resource.name = fileEntry.name;
                                    resource.extension = fileEntry.name.substring(fileEntry.name.lastIndexOf('.') + 1, fileEntry.name.length);
                                    resource.path = fileEntry.nativeURL.substring(0, fileEntry.nativeURL.lastIndexOf('/'));

                                    $cordovaFile.readAsDataURL(resource.path, resource.name)
                                    .then(function(fileDataURL) {
                                        resource.fileURL = fileDataURL;
                                        resource.stream = fileDataURL.substring(fileDataURL.lastIndexOf(';base64,') + 8, fileDataURL.length);
                                        return $cordovaFile.removeFile(resource.path, resource.name);
                                    })
                                    .then(function(success) {
                                        deferred.resolve(true);
                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                        deferred.reject(error);
                                    })
                                },
                                function(error) {
                                    console.log('Error resolving file: ' + error);
                                    deferred.reject('Error resolving file: ' + error);
                                }
                            );
                        }, function(error) {
                            console.log('Error creating file: ' + error);
                            deferred.reject('Error creating file: ' + error);
                        });
                    },
                    function(error) {
                        console.log('Error getting contract: ' + error);
                        deferred.reject('Error getting contract: ' + error);
                    });
                },
                function (error) {
                    console.log(error);
                    deferred.reject(error);
                }
            );

            return deferred.promise;
        }
        /****************/
        /* PUBLIC METHODS
        /****************/
        return {
            b64toBlob: b64toBlob,
            goToLoginPage: goToLoginPage,
            setGeneralVariables: setGeneralVariables,
            objectInNestedObjectsByName: objectInNestedObjectsByName,
            processObjectsArrayForSelectOptions: processObjectsArrayForSelectOptions,
            getMultivaluedFieldAuxFields: getMultivaluedFieldAuxFields,
            chooseFile: chooseFile
        }
    }];
});
