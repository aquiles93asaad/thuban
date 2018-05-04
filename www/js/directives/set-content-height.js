"user strict";

angular.module('ThubanApp')

.directive('setContentHeight', setContentHeight);

setContentHeight.$inject = ['$state']

function setContentHeight($state) {
    var directive = {
        link: link,
        scope: true,
        restrict: 'A'
    };

    return directive;

    function link (scope, element, attrs) {
        var scroll = angular.element(element).find('.scroll')[0];
        angular.element(scroll).height(window.innerHeight - angular.element('.nav-bar-block .bar-header').outerHeight());
    }
}
