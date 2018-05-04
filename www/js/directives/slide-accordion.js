"user strict";

angular.module('ThubanApp')

.directive('slideAccordion', slideAccordion);

slideAccordion.$inject = [];

function slideAccordion() {
    var directive = {
        link: link,
        scope: true,
        restrict: 'A'
    };

    return directive;

    function link (scope, element, attrs) {
        var header = element.find('> .ac-header');
        var body = element.find('.ac-body');
        header.on('click', function() {
            if(attrs.closeOthers == 'true') {
                angular.element('.item-accordion.open').not(element).removeClass('open')
                angular.element('.item-accordion.open').not(element).height(parseInt(attrs.accordionHeaderHeight));
            }

            if(element.hasClass('open')) {
                element.height(parseInt(attrs.accordionHeaderHeight));

                if(attrs.hasAccordionFather == 'true') {
                    var parent = element.parents('.slide-accordion');
                    parent.height(parent.height() - body.outerHeight());
                }
            } else {
                if(attrs.functionToCall) {
                    // calls the function that should be in the controller containing the element with the directive
                    scope.$parent.$parent[attrs.functionToCall]();
                }

                element.height(element.height() + body.outerHeight());

                if(attrs.hasAccordionFather == 'true') {
                    var parent = element.parents('.slide-accordion');
                    parent.height(parent.height() + body.outerHeight());
                }
            }

            element.toggleClass('open');
        });
    }
}
