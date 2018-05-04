"use strict";

angular.module('ThubanApp')

    .controller('ItemNotesController', ItemNotesController);

ItemNotesController.$inject = [
    '$scope',
    '$rootScope',
    '$stateParams',
    '$cordovaToast',
    '$ionicPlatform',
    '$ionicModal',
    '$ionicLoading',
    '$ionicPopup',
    'DocumentServices',
    'SearchServices',
    'notesRights'
];

function ItemNotesController(
    $scope,
    $rootScope,
    $stateParams,
    $cordovaToast,
    $ionicPlatform,
    $ionicModal,
    $ionicLoading,
    $ionicPopup,
    DocumentServices,
    SearchServices,
    notesRights
) {

    $scope.notes = $rootScope.actualItem.notes;
    $scope.rights = notesRights;
    var originalValues = null;

    function setVariables() {
        $scope.note = {
            id: null,
            title: null,
            body: null,
            date: null,
            time: null,
            user: null
        }

        originalValues = {
            title: null,
            body: null
        }
    }

    function onClosingNoteModal() {
        if (($scope.note.title != originalValues.title) || ($scope.note.body != originalValues.body)) {
            var confirmPopup = $ionicPopup.confirm({
                subTitle: '¿Los cambios no guardados se perderán, ¿desea continuar?',
                cancelText: 'Cancelar',
                okText: 'OK'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    setVariables();
                    $scope.noteModal.hide();
                }
            });
        } else {
            setVariables();
            $scope.noteModal.hide();
        }
    }

    setVariables();

    document.addEventListener("deviceready", function () {
        $ionicModal.fromTemplateUrl('templates/partials/note.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.noteModal = modal;
        });
    }, false);

    $scope.saveOrUpdateNote = function () {
        if (!$scope.note.title || $scope.note.title == '' || !$scope.note.body || $scope.note.body == '') {
            $cordovaToast.showShortBottom('Los campos Título y Descripción son requeridos');
        } else {
            var params = {
                documentID: $stateParams.documentId,
                action: ($scope.note.id == null) ? 'A' : 'M',
                note: {
                    id: ($scope.note.id == null) ? null : $scope.note.id,
                    title: $scope.note.title,
                    body: $scope.note.body
                }
            };

            $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            DocumentServices.noteAMD(params)
                .then(function (success) {

                    if ($scope.note.id) {
                        $cordovaToast.showShortBottom('La nota fue modificada correctamente');
                    } else {
                        $scope.note.id = success;
                        $scope.note.user = $rootScope.userName;
                        $scope.note.date = moment().format('DD/MM/YYYY');
                        $scope.note.time = moment().format('HH:mm');
                        $scope.notes.unshift($scope.note);
                        $cordovaToast.showShortBottom('La nota fue creada correctamente');
                    }

                    setVariables();
                    $scope.noteModal.hide();
                })
                .catch(function (error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function () {
                    $ionicLoading.hide();
                });
        }
    };

    $scope.deleteNote = function () {
        var confirmPopup = $ionicPopup.confirm({
            subTitle: 'Está a punto de eliminar la nota, ¿desea continuar?',
            cancelText: 'Cancelar',
            okText: 'OK'
        });

        confirmPopup.then(function (res) {
            if (res) {
                var params = {
                    documentID: $stateParams.documentId,
                    action: 'D',
                    note: {
                        id: $scope.note.id,
                        title: $scope.note.title,
                        body: $scope.note.body
                    }
                };
        
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });
        
                DocumentServices.noteAMD(params)
                .then(function (success) {
                    $cordovaToast.showShortBottom('La nota fue eliminada correctamente');
        
                    // we have an array of notes, we want to remove one note using only its id
                    // get index of the eliminated note
                    var removeIndex = $scope.notes.map(function (note) {return note.id; }).indexOf($scope.note.id);
        
                    // remove the note from the array of ntoes
                    $scope.notes.splice(removeIndex, 1);
        
                    setVariables();
                    $scope.noteModal.hide();
                })
                .catch(function (error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function () {
                    $ionicLoading.hide();
                });
            }
        });
    };

    $scope.openNoteModal = function (id) {
        if (typeof id !== 'undefined') {
            for (var i = 0; i < $scope.notes.length; i++) {
                if ($scope.notes[i].id == id) {
                    $scope.note = $scope.notes[i];
                    originalValues.title = $scope.note.title;
                    originalValues.body = $scope.note.body;
                }
            }
        }

        $scope.noteModal.show();
    };

    $scope.closeNoteModal = function () {
        onClosingNoteModal();
    };

    $scope.modifyRight = function () {
        if ($scope.note.id == null) {
            return false;
        } else {
            if ($scope.rights.modifyAny) {
                return false;
            } else {
                if ($scope.rights.modifyOwn && ($scope.note.user.toLowerCase() == $rootScope.userName.toLowerCase())) {
                    return false;
                }
            }
        }

        return true;
    }

    var backButtonAction = $ionicPlatform.registerBackButtonAction(function (event) {
        if ($scope.noteModal.isShown()) {
            onClosingNoteModal();
        } else {
            navigator.app.backHistory();
        }
    }, 201);

    $scope.$on('$destroy', function () {
        $scope.noteModal.remove();
    });

    $scope.$on('$destroy', backButtonAction);
}
