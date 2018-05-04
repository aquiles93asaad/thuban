"user strict";

angular.module('ThubanApp')

.directive('menuItem', menuItem);

menuItem.$inject = ['$rootScope', '$state', '$ionicSideMenuDelegate'];

function menuItem($rootScope, $state, $ionicSideMenuDelegate) {
    var directive = {
        link: link,
        scope: true,
        restrict: 'A'
    };

    return directive;

    function link (scope, element, attrs) {
        if($state.current.name == attrs.uiSref) {
            angular.element(element).addClass('chosen');
        }

        angular.element(element).on('click', function() {
            if(!angular.element(this).hasClass('chosen')) {
                angular.element('.menu .menu-item').removeClass('chosen');
                angular.element(this).addClass('chosen');
                $ionicSideMenuDelegate.toggleLeft();
                $rootScope.$broadcast('$menuItemChanged');
            }

            angular.element('.menu.menu-left').css({
                'transform' : 'translate3d(-320px, 0, 0)'
            });
        });
    }
}
