'use strict';

angular.module('ThubanApp')

.controller('LoginController', LoginController);

LoginController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$cordovaToast',
    '$ionicLoading',
    '$ionicModal',
    'localStorageService',
    'AdminServices',
    'Utils'
];

function LoginController(
    $scope,
    $rootScope,
    $state,
    $cordovaToast,
    $ionicLoading,
    $ionicModal,
    localStorageService,
    AdminServices,
    Utils
) {

    $scope.loginForm = {
        user: $rootScope.userName,
        password: ''
    };

    $scope.configForm = {
        serverInput: $rootScope.serverEndpoint
    }

    document.addEventListener('deviceready', function () {
        $ionicModal.fromTemplateUrl('templates/partials/login-configuration.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.loginConfigurationModal = modal;
        });
    });

    $scope.openLoginConfigurationModal = function() {
        $scope.loginConfigurationModal.show();
    };

    $scope.closeLoginConfigurationModal = function() {
        $scope.loginConfigurationModal.hide();
    };

    $scope.$on('$destroy', function() {
        $scope.loginConfigurationModal.remove();
    });

    $scope.logIn = function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.close();
        }

        if($rootScope.serverEndpoint != null && $rootScope.serverEndpoint != '') {
            if($scope.loginForm.user != null && $scope.loginForm.user != undefined && $scope.loginForm.user != '') {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                AdminServices.getToken($scope.loginForm)
                .then(function(token) {
                    $rootScope.token = token.msg;
                    $rootScope.userName = $scope.loginForm.user;
                    localStorageService.set('lastUsername', $scope.loginForm.user);
                    $scope.loginForm.password = '';
                    $state.go('app.home');
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                    console.log(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
            } else {
                $cordovaToast.showShortBottom('Debe ingresar un usuario para ingresar.');
            }
        } else {
            $cordovaToast.showShortBottom('Debe configurar el servidor primero.');
            $scope.openLoginConfigurationModal();
        }
    };

    $scope.submitEndpoint = function() {
        if($scope.configForm.serverInput == '' || $scope.configForm.serverInput == null) {
            $cordovaToast.showShortBottom('Debe agregar un servidor para seguir!');
        } else {
            try {
                $scope.configForm.serverInput = $scope.configForm.serverInput.endsWith('/') ? $scope.configForm.serverInput : $scope.configForm.serverInput + '/';
            } catch (err) {
                $scope.configForm.serverInput = $scope.configForm.serverInput.match('/$')=='/' ? $scope.configForm.serverInput : $scope.configForm.serverInput + '/';
            }

            $rootScope.serverEndpoint = $scope.configForm.serverInput;
            localStorageService.set('server', $scope.configForm.serverInput);
            $scope.closeLoginConfigurationModal();
        }
    };

    $scope.closeKeyboard = function(event) {
        if(event.key == 'Enter'){
            event.preventDefault();

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.close();
            }
        }
    };
}
