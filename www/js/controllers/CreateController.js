'use strict';

angular.module('ThubanApp')

.controller('CreateController', CreateController);

CreateController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$compile',
    '$cordovaCamera',
    '$cordovaToast',
    '$ionicLoading',
    'AdminServices',
    'DocumentServices',
    'SearchServices',
    'Utils',
    'documentClasses'
];

function CreateController(
    $scope,
    $rootScope,
    $state,
    $compile,
    $cordovaCamera,
    $cordovaToast,
    $ionicLoading,
    AdminServices,
    DocumentServices,
    SearchServices,
    Utils,
    documentClasses
) {

    if(typeof documentClasses !== 'undefined') {
        var anotherMenuItem = false;
        var obligatoryFields = [];
        var createWithoutResource = false;

        var validDocumentClasses = [];

        for (var i = 0; i < documentClasses.length; i++) {
            if(typeof documentClasses[i].suitableMobile !== 'undefined' && documentClasses[i].suitableMobile) {
                validDocumentClasses.push(documentClasses[i]);
            }
        }
        /*
         * $scope.create.documentClasses is object of the documentClasses with key/value pairs
         *      keys will be numbers starting from 0, and values will be the objects documentClasses obtained from the service
         * $scope.docClassesViews is array of objects {id: int, text: documentClassAlias/documentClassId } for the select2 plugin
        */
        $scope.create = {
            documentClasses: {},
            chosenDocumentClassId: null,
            chosenDocumentClassAlias: null,
            chosenDocumentClassViewId: null
        };
        $scope.docClassesViews = [];

        Utils.processObjectsArrayForSelectOptions(validDocumentClasses, $scope.docClassesViews, $scope.create.documentClasses, 'alias', 'classID');

        $scope.isIOS = ionic.Platform.isIOS();
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

    function initVariables() {
        $scope.classFields = null;
        $scope.options = {
            keepValues: false
        };

        setResourceVariable();
        obligatoryFields = [];
        createWithoutResource = false;
    }

    document.addEventListener('deviceready', function () {
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
    });

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
        })
    };

    $scope.loadFields = function() {
        $scope.create.chosenDocumentClassId = $scope.create.documentClasses[$scope.create.chosenDocumentClassViewId].classID;
        $scope.create.chosenDocumentClassAlias = $scope.create.documentClasses[$scope.create.chosenDocumentClassViewId].alias;

        if ($scope.create.chosenDocumentClassId != null && $scope.create.chosenDocumentClassId.trim() != '') {
            initVariables();

            $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            var params = {
                documentClass: $scope.create.chosenDocumentClassId
            };

            AdminServices.getDocumentClassFields(params)
            .then(function(classFields) {
                $scope.classFields = classFields;
                var params = {
                    section: 'CLASS',
                    rightName: 'DOC_CREATE_INDEXES',
                    docClass: $scope.create.chosenDocumentClassId
                };

                return AdminServices.getAccessRightForAction(params);
            })
            .then(function(hasAccess) {
                createWithoutResource = hasAccess;
            })
            .catch(function(error) {
                $cordovaToast.showShortBottom(error);
            })
            .finally(function() {
                $ionicLoading.hide();
            });
        } else {
            $cordovaToast.showShortBottom('Seleccione una clase documental');
        }
    };

    $scope.populateSelectField = function(event, field, index) {
        event.preventDefault();

        var fakeSelect = angular.element(event.target);

        SearchServices.getMultivaluedFieldValues(field, false)
        .then(function(values) {
            $scope[field.id + '-options'] = [];
            Utils.processObjectsArrayForSelectOptions(values, $scope[field.id + '-options'], {}, '', '');
            var parent = fakeSelect.parent();
            var html = '';
            html += '<select my-select2 class="my-select2" ng-model="classFields[' + index + '].value" place-holder="" select-options="' + field.id + '-options' + '" min-results-for-search="20" style="width: 100%">';
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

    $scope.createDocument = function() {
        if(!createWithoutResource && !$scope.resource.isAdded) {
            $cordovaToast.showShortBottom('No posee permisos para crear documentos sin imagen.');
        } else {
            var createFields = [];
            var missObligatoryField = false;

            for (var i = 0; i < $scope.classFields.length; i++) {
                if($scope.classFields[i].visibility == 'mandatory' && ($scope.classFields[i].value == '' || $scope.classFields[i].value == null)) {
                    missObligatoryField = true;
                    break;
                }

                if($scope.classFields[i].value != '' && $scope.classFields[i].value != null) {
                    createFields.push({
                        key: $scope.classFields[i].id,
                        value: ($scope.classFields[i].dataType == 'date') ? moment($scope.classFields[i].value).format('YYYYMMDD HH:mm:ss') :  $scope.classFields[i].value,
                        dataType: $scope.classFields[i].dataType
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
                    documentClass: $scope.create.chosenDocumentClassId,
                    fields: createFields
                }

                if ($scope.resource.stream != null) {
                    params.resource = {
                        extension: $scope.resource.extension,
                        stream: $scope.resource.stream
                    }
                }

                DocumentServices.createDocument(params)
                .then(function(success) {
                    setResourceVariable();
                    $cordovaToast.showShortBottom('El documento se creó correctamente.');
                    if(!$scope.options.keepValues) {
                        for (var i = 0; i < $scope.classFields.length; i++) {
                            $scope.classFields[i].value = null;
                        }
                    }
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                })
            } else {
                $cordovaToast.showShortBottom('Complete todos los campos obligatorios.');
            }
        }
    };

    $rootScope.$on('$menuItemChanged', function() {
        if($state.current.name != 'app.create') {
            anotherMenuItem = true;
        }
    });

    $rootScope.$on('$ionicView.leave', function() {
        if(anotherMenuItem) {
            if(typeof $scope.create !== 'undefined') {
                $scope.create.chosenDocumentClassId = null;
                $scope.create.chosenDocumentClassViewId = null;
                initVariables();
                anotherMenuItem = false;
            }
        }
    });
}
