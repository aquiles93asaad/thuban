"use strict";

angular.module('ThubanApp')

.controller('AppController', AppController);

AppController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$ionicHistory',
    '$ionicSideMenuDelegate',
    'Utils'
];

function AppController(
    $scope,
    $rootScope,
    $state,
    $ionicHistory,
    $ionicSideMenuDelegate,
    Utils
) {

    Utils.setGeneralVariables();

    $scope.$watch(function () {
        return $ionicSideMenuDelegate.isOpenLeft();
    }, function (isOpen) {
        var icon = angular.element('.menu-content .left-buttons button');
        var menu = angular.element('.menu.menu-left');
        var scrollContent = angular.element('.menu-content .scroll-content');

        if (isOpen) {
            menu.css({
                'transform' : 'translate3d(0, 0, 0)'
            });

            icon.removeClass('ion-navicon-round');
            icon.addClass('ion-arrow-right-c open');
            scrollContent.append('<div class="custom-backdrop"></div>');
        } else {
            menu.css({
                'transform' : 'translate3d(-320px, 0, 0)'
            });

            icon.removeClass('ion-arrow-right-c open');
            icon.addClass('ion-navicon-round');
            scrollContent.find('.custom-backdrop').remove();
        }
    });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if($state.current.name == 'app.home') {
            angular.element('.menu .menu-item').removeClass('chosen');
        }

        if(toState.name === 'app.traysItemsList' || toState.name === 'app.itemsList') {
            if($rootScope.executreTrayDenied) {
                event.preventDefault();

                if(fromState.name === 'app.traysItemsList') {
                    $state.go(fromState.name, {trayName: fromParams.trayName});
                } else {
                    $state.go(fromState.name);
                }
            }
        }
    });

    $scope.goToHomePage = function() {
        $ionicHistory.nextViewOptions({
            disableBack: true
        });

        $state.go('app.home');
    };

    $scope.logOut = function() {
        Utils.goToLoginPage();
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
