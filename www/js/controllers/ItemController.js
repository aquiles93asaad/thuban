'use strict';

angular.module('ThubanApp')

.controller('ItemController', ItemController);

ItemController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$compile',
    '$cordovaCamera',
    '$cordovaFile',
    '$cordovaFileOpener2',
    '$cordovaToast',
    '$ionicLoading',
    '$ionicModal',
    '$ionicPlatform',
    '$ionicPopup',
    '$ionicHistory',
    'SearchServices',
    'AdminServices',
    'ResourceServices',
    'DocumentServices',
    'Utils',
    'item',
    'WS_SUC_COD_RET'
];

function ItemController(
    $scope,
    $rootScope,
    $state,
    $compile,
    $cordovaCamera,
    $cordovaFile,
    $cordovaFileOpener2,
    $cordovaToast,
    $ionicLoading,
    $ionicModal,
    $ionicPlatform,
    $ionicPopup,
    $ionicHistory,
    SearchServices,
    AdminServices,
    ResourceServices,
    DocumentServices,
    Utils,
    item,
    WS_SUC_COD_RET
) {

    var file = null;
    var fileName = null;
    var fileType = null;
    var unwantedFields = [];
    var originalValues = {};
    var backView = $ionicHistory.backView();

    /****************/
    /* PRIVATE METHODS
    /****************/
    function processResourceInfo(data) {
        fileName = $scope.document.id + '.' + data.extension;
        fileType = data.type;
        return Utils.b64toBlob(data.stream, data.type);
    }

    function initDocument(itemData) {
        setResourceVariable();
        $scope.document = itemData.document;
        $scope.document.locked = false;

        if(backView.stateName == 'app.traysItemsList') {
            $scope.documentClassAlias = $scope.document.docClass;
        } else {
            $scope.documentClassAlias = (($rootScope.actualList.documentClassAlias) ? $rootScope.actualList.documentClassAlias : $scope.document.docClass);
        }

        $scope.history = itemData.history;
        $rootScope.actualItem.docClass = $scope.document.docClass;
        $rootScope.actualItem.notes = itemData.notes;

        file = null;
        fileName = null;
        fileType = null;
        unwantedFields = [];
        originalValues = {};

        angular.forEach($scope.document.fields, function(field, key) {
            if($rootScope.actualList.classFields[field.key]) {
                field.label = $rootScope.actualList.classFields[field.key].label;
                field.maxLength = $rootScope.actualList.classFields[field.key].maxLength;
                field.multivalued = $rootScope.actualList.classFields[field.key].multivalued;
                field.visibility = $rootScope.actualList.classFields[field.key].visibility;
                field.dataType = $rootScope.actualList.classFields[field.key].dataType;
                field.classID = $scope.document.docClass;

                if(typeof field.value === 'undefined') {
                    field.value = null;
                }
            } else {
                unwantedFields.push(key);
            }

            if (field.value != null) {
                if(field.dataType == 'date') {
                    var date = field.value.split(' ')[0];
                    date = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6, 8);
                    field.value = new Date(moment(date));
                    originalValues[field.key] = new Date(moment(date));
                } else if (field.dataType == 'integer') {
                    originalValues[field.key] = parseInt(field.value);
                    field.value = parseInt(field.value);
                } else if (field.dataType == 'decimal') {
                    originalValues[field.key] = parseFloat(field.value);
                    field.value = parseFloat(field.value);
                } else {
                    originalValues[field.key] = field.value;
                }
            }
        });

        for (var i = unwantedFields.length - 1; i >= 0; i--) {
            $scope.document.fields.splice(unwantedFields[i], 1);
        }
    }

    function setResourceVariable(type) {
        if(typeof type === 'undefined') {
            type = null;
        }

        if(type == null) {
            $scope.resource = {
                showImage: false,
                showName: false,
                name: null,
                stream: null,
                extension: null,
                path: null,
                fileURL: null,
                isAdded: false
            }
        } else {
            $scope.resource.isAdded = true;

            if ( type == 'image') {
                $scope.resource.showImage = true;
                $scope.resource.showName = false;
            } else {
                $scope.resource.showImage = false;
                $scope.resource.showName = true;
            }
        }
    }

    function lockDocumentAction() {
        $ionicLoading.show({
            content: 'Loading',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var params = {
            documentID: $scope.document.id
        }

        DocumentServices.lockDocument(params)
        .then(function(success) {
            $scope.document.locked = !$scope.document.locked;
        })
        .catch(function(error) {
            $cordovaToast.showShortBottom(error);
        })
        .finally(function() {
            $ionicLoading.hide();
        });
    }

    initDocument(item);
    $scope.isIOS = ionic.Platform.isIOS();

    /****************/
    /* PUBLIC METHODS
    /****************/

    document.addEventListener("deviceready", function () {
        $ionicModal.fromTemplateUrl('templates/partials/add-resource.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.addResourceModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/partials/item-history.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.historyModal = modal;
        });

        var cameraOptions = {
            quality: 100,
            targetWidth: 750,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };

        $scope.takePicture = function() {
            $cordovaCamera.getPicture(cameraOptions)
            .then(function(imageData) {
                var image = document.getElementById('resource-image');
                image.src = 'data:image/jpg;base64,' + imageData;
                $scope.resource.stream = imageData;
                $scope.resource.extension = 'jpg';
                setResourceVariable('image');
            }, function(err) {
                console.log(err);
                if(err != 'Camera cancelled.') {
                    $cordovaToast.showShortBottom('No se pudo tomar la foto. Intentelo de nuevo.');
                }
            });
        };
    }, false);

    $scope.updateDocument = function() {
        var createFields = [];
        var missObligatoryField = false;

        for (var i = 0; i < $scope.document.fields.length; i++) {
            if($scope.document.fields[i].visibility == 'mandatory' && ($scope.document.fields[i].value == '' || $scope.document.fields[i].value == null)) {
                missObligatoryField = true;
                break;
            }

            if($scope.document.fields != '' && $scope.document.fields[i].value != null) {
                createFields.push({
                    key: $scope.document.fields[i].key,
                    value: ($scope.document.fields[i].dataType == 'date') ? moment($scope.document.fields[i].value).format('YYYYMMDD HH:mm:ss') :  $scope.document.fields[i].value,
                    dataType: $scope.document.fields[i].dataType
                });
            }
        }

        if(!missObligatoryField) {
            $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            var params = {
                documentID: $scope.document.id,
                fields: createFields
            }

            if ($scope.resource.stream != null) {
                params.resource = {
                    extension: $scope.resource.extension,
                    stream: $scope.resource.stream
                }
            }

            DocumentServices.updateDocument(params)
            .then(function(success) {
                setResourceVariable();

                params = {
                    documentID: $scope.document.id
                }

                return DocumentServices.lockDocument(params);
            })
            .then(function(success) {
                $scope.document.locked = !$scope.document.locked;

                for (var i = 0; i < $scope.document.fields.length; i++) {
                    originalValues[$scope.document.fields[i].key] = $scope.document.fields[i].value;
                }

                $scope.changesMade = false;

                $cordovaToast.showShortBottom("El documento se actualizó correctamente.");
            })
            .catch(function(error) {
                $cordovaToast.showShortBottom(error);
            })
            .finally(function() {
                $ionicLoading.hide();
            })
        } else {
            $cordovaToast.showShortBottom("Complete todos los campos obligatorios.");
        }
    }

    $scope.lockDocument = function() {
        // Asking if the user has permission to modify the document.
        var params = {
            section: 'CLASS',
            rightName: 'DOC_MODIFY',
            docClass: $scope.document.docClass
        };

        AdminServices.getAccessRightForAction(params)
        .then(function(hasAccess) {
            if(hasAccess) {
                // Asking if the documentClass can be modified from the app.
                var canModify = false;

                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                params = {
                    forAction: "create"
                };

                AdminServices.getDocumentClasses(params)
                .then(function(classes) {
                    for (var i = 0; i < classes.length; i++) {
                        if(classes[i].classID == $scope.document.docClass && typeof classes[i].suitableMobile !== 'undefined' && classes[i].suitableMobile) {
                            canModify = true;
                            break;
                        }
                    }

                    if(canModify) {
                        if($scope.document.locked && ($scope.changesMade || $scope.resource.isAdded)) {
                            var confirmPopup = $ionicPopup.confirm({
                                subTitle: '¿Los cambios no guardados se perderán, ¿desea continuar?',
                                cancelText: 'Cancelar',
                                okText: 'OK'
                            });
                
                            confirmPopup.then(function(res) {
                                if(res) {
                                    lockDocumentAction();
                                    for (var i = 0; i < $scope.document.fields.length; i++) {
                                        $scope.document.fields[i].value = originalValues[$scope.document.fields[i].key];
                                    }
                                    $scope.changesMade = false;
                                }
                            });
                        } else {
                            lockDocumentAction();
                        }
                    } else {
                        $cordovaToast.showShortBottom('La clase documental de este documento no se puede editar desde la aplicación.');    
                    }
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
            } else {
                $cordovaToast.showShortBottom('No posee permiso para modificar el documento.');
            }
        })
        .catch(function(error) {
            $cordovaToast.showShortBottom(error);
        });
    }

    $scope.populateSelectField = function(event, field, index) {
        event.preventDefault();

        var fakeSelect = angular.element(event.target);

        SearchServices.getMultivaluedFieldValues(field, false)
        .then(function(values) {
            $scope[field.key + '-options'] = [];
            Utils.processObjectsArrayForSelectOptions(values, $scope[field.key + '-options'], {}, '', '');
            var parent = fakeSelect.parent();
            var html = '';
            html += '<select my-select2 class="my-select2" ng-model="document.fields[' + index + '].value" place-holder="" select-options="' + field.key + '-options' + '" min-results-for-search="20" style="width: 100%" ng-disabled="!document.locked">';
            html +=     '<option></option>';
            html += '</select>' ;

            var observer = new MutationObserver(function(mutations) {
                var self = this;
                //loop through the detected mutations(added controls)
                mutations.forEach(function(mutation) {
                    //addedNodes contains all detected new controls
                    if (mutation && mutation.addedNodes) {
                        mutation.addedNodes.forEach(function(elm) {
                            //only apply select2 to select elements
                            if (elm && elm.nodeName === 'SELECT') {
                                var template = angular.element(elm);
                                var linkFn = $compile(template);
                                var element = linkFn($scope);
                                angular.element(element).select2('open');
                                angular.element(element).val(field.value);
                                angular.element(element).trigger('change');
                                // later, you can stop observing
                                self.disconnect();
                            }
                        });
                    }
                });
            });
            // pass in the target node, as well as the observer options
            observer.observe(parent[0], {
                childList: true
            });

            angular.element(parent).html(html);
        })
        .catch(function(error) {
            $cordovaToast.showShortBottom(error);
        });
    };

    /* Funciones para el recurso adjunto */
    $scope.showResource = function() {
        if($scope.document.hasResource) {
            $cordovaFile.checkFile($rootScope.cacheDirectory, ((fileName) ? fileName: $scope.document.id ))
            .then(function(success) {
                $cordovaFileOpener2.open($rootScope.cacheDirectory + ((fileName) ? fileName: $scope.document.id ), fileType);
            })
            .catch(function(error) {
                if(error.code == 1) {
                    $ionicLoading.show({
                        content: 'Loading',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });

                    var params = {
                        section: 'CLASS',
                        rightName: 'DOC_QUERY',
                        docClass: $scope.document.docClass
                    };

                    AdminServices.getAccessRightForAction(params)
                    .then(function(hasAccess) {
                        if(hasAccess) {
                            ResourceServices.getResource({ documentID: $scope.document.id })
                            .then(function(data) {
                                file = processResourceInfo(data);
                                return $cordovaFile.writeFile($rootScope.cacheDirectory, fileName, file, true);
                            })
                            .then(function(success) {
                                $cordovaFileOpener2.open($rootScope.cacheDirectory + fileName, fileType);
                            })
                            .catch(function(error) {
                                $cordovaToast.showShortBottom(error);
                            })
                            .finally(function() {
                                $ionicLoading.hide();
                            });
                        } else {
                            $cordovaToast.showShortBottom('No posee permiso para visualizar este documento.');
                            $ionicLoading.hide();
                        }
                    })
                    .catch(function(error) {
                        $ionicLoading.hide();
                        $cordovaToast.showShortBottom(error);
                    });
                }
            });
        }
    };

    $scope.downloadResource = function() {
        if($scope.document.hasResource) {
            $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            var params = {
                section: 'CLASS',
                rightName: 'DOC_EXPORT',
                docClass: $scope.document.docClass
            };

            AdminServices.getAccessRightForAction(params)
            .then(function(hasAccess) {
                if(hasAccess) {
                    ResourceServices.getResource({ documentID: $scope.document.id })
                    .then(function(data) {
                        file = processResourceInfo(data);
                        return $cordovaFile.createDir($rootScope.dataDirectory, 'Thuban', false);
                    })
                    .then(function(success) {
                        $cordovaFile.writeFile($rootScope.dataDirectory + 'Thuban/', fileName, file, true);
                    })
                    .then(function(success) {
                        $cordovaToast.showShortBottom("El archivo fue descargado correctamente.");
                    })
                    .catch(function(error) {
                        if(error.code == 12) {
                            $cordovaFile.writeFile($rootScope.dataDirectory + 'Thuban/', fileName, file, true)
                            .then(function(success) {
                                $cordovaToast.showShortBottom("El archivo fue descargado correctamente.");
                            })
                            .catch(function(error) {
                                $cordovaToast.showShortBottom(error);
                            });
                        } else {
                            $cordovaToast.showShortBottom(error);
                        }
                    })
                    .finally(function() {
                        $ionicLoading.hide();
                    });
                } else {
                    $ionicLoading.hide();
                    $cordovaToast.showShortBottom('No posee permiso para descargar el recurso de este documento.');
                }
            })
            .catch(function(error) {
                $ionicLoading.hide();
                $cordovaToast.showShortBottom(error);
            });
        }
    };

    $scope.deleteResource = function() {
        var confirmPopup = $ionicPopup.confirm({
            subTitle: '¿Eliminar el recurso asociado del documento?',
            cancelText: 'Cancelar',
            okText: 'Eliminar'
        });

        confirmPopup.then(function(res) {
            if(res) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                var params = {
                    section: 'CLASS',
                    rightName: 'DOC_DELETE',
                    docClass: $scope.document.docClass
                };

                AdminServices.getAccessRightForAction(params)
                .then(function(hasAccess) {
                    if(hasAccess) {
                        ResourceServices.deleteResource({ documentID: $scope.document.id })
                        .then(function(success) {
                            $cordovaToast.showShortBottom("El archivo fue eliminado correctamente.");
                            var params = {
                                documentID: $scope.document.id,
                                allFields: true,
                                includeNotes: true,
                                includeHistory: true
                            };

                            return SearchServices.getDocument(params)
                        })
                        .then(function(data) {
                            initDocument(data);
                        })
                        .catch(function(error) {
                            $cordovaToast.showShortBottom("El archivo no se pudo eliminr. Intente de nuevo.");
                        })
                        .finally(function() {
                            $ionicLoading.hide();
                        });
                    } else {
                        $ionicLoading.hide();
                        $cordovaToast.showShortBottom('No posee permiso para eliminar el recurso asociado.');
                    }
                })
                .catch(function(error) {
                    $ionicLoading.hide();
                    $cordovaToast.showShortBottom(error);
                })
            }
        });
    };

    $scope.openAddResourceModal = function() {
        $ionicLoading.show({
            content: 'Loading',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var params = {
            section: 'CLASS',
            rightName: 'DOC_IMPORT',
            docClass: $scope.document.docClass
        };

        AdminServices.getAccessRightForAction(params)
        .then(function(hasAccess) {
            if(hasAccess) {
                $scope.addResourceModal.show();
            } else {
                $cordovaToast.showShortBottom('No posee permiso para modificar el recurso de este documento.');
            }
        })
        .catch(function(error) {
            $cordovaToast.showShortBottom(error);
        })
        .finally(function() {
            $ionicLoading.hide();
        });
    };

    $scope.closeAddResourceModal = function() {
        $scope.addResourceModal.hide();
    };

    $scope.chooseFile = function() {
        Utils.chooseFile($scope.resource)
        .then(function(success) {
            if($scope.resource.extension == 'png' || $scope.resource.extension == 'jpg' || $scope.resource.extension == 'jpeg') {
                var image = document.getElementById('resource-image');
                image.src = $scope.resource.fileURL;
                setResourceVariable('image');
            } else {
                setResourceVariable('file');
            }

            $scope.$broadcast('resource-changed', { extension: $scope.resource.extension });
        })
        .catch(function(error) {
            $cordovaToast.showShortBottom(error);
        });
    };

    $scope.cancelResource = function() {
        setResourceVariable();
    };
    /********************************/

    $scope.getNotes = function() {
        $state.go('app.itemNotes', {documentId: $scope.document.id});
    };

    $scope.openHistoryModal = function() {
        $scope.historyModal.show();
    };

    $scope.closeHistoryModal = function() {
        $scope.historyModal.hide();
    };

    /****************/
    /* controlling backbuttons actions
    /****************/
    var doCustomBack = function() {
        if($scope.changesMade || $scope.resource.isAdded) {
            var confirmPopup = $ionicPopup.confirm({
                subTitle: '¿Los cambios no guardados se perderán, ¿desea continuar?',
                cancelText: 'Cancelar',
                okText: 'OK'
            });

            confirmPopup.then(function(res) {
                if(res) {
                    $ionicHistory.goBack();
                }
            });
        } else {
            $ionicHistory.goBack();
        }
    };

    var oldSoftBack = $rootScope.$ionicGoBack;

    $rootScope.$ionicGoBack = function() {
        doCustomBack();
    };

    var deregisterSoftBack = function() {
        $rootScope.$ionicGoBack = oldSoftBack;
    };

    var deregisterHardBack = $ionicPlatform.registerBackButtonAction(doCustomBack, 101);

    /****************/
    /* Events Watchers and listeners
    /****************/
    $scope.$on("$ionicView.leave", function() {
        $cordovaFile.checkFile($rootScope.cacheDirectory, fileName)
        .then(function(success) {
            return $cordovaFile.removeFile($rootScope.cacheDirectory, fileName);
        })
        .then(function(success) {
            console.log("File deleted from cache");
        })
        .catch(function(error) {
            if(error.code == 1) {
                console.log("No document in cache to eliminate");
            }
        });
    });

    $scope.$watch('document.fields', function (newVal, oldVal) {
        var changesMade = false;
        var field = null;
        var originalValue = null;

        for (var i = 0; i < $scope.document.fields.length; i++) {
            field = $scope.document.fields[i];
            originalValue = originalValues[field.key];

            if(field.dataType == 'date') {
                if(field.value.getTime() != originalValue.getTime()) {
                    changesMade = true;
                }
            } else {
                if(field.value != originalValue) {
                    changesMade = true;
                }
            }
        }

        if(changesMade) {
            $scope.changesMade = true;
        } else {
            $scope.changesMade = false;
        }
    }, true);

    $scope.$on('$destroy', function() {
        $scope.addResourceModal.remove();
        $scope.historyModal.remove();
        deregisterSoftBack();
        deregisterHardBack();
    });
}
