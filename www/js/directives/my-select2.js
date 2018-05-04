"user strict";

angular.module('ThubanApp')

.directive('mySelect2', mySelect2);

mySelect2.$inject = ['$timeout', '$ionicScrollDelegate'];

function mySelect2($timeout, $ionicScrollDelegate) {
    var directive = {
        link: link,
        scope: true,
        restrict: 'A'
    };

    return directive;

    function link (scope, element, attrs) {
        /*
         * attrs.selectOptions is the name of the array of options
         * the options of the select2 must be objects of this type --> { id: int, text: String }
        */
        var params = {
            data: (scope.$parent.$parent[attrs.selectOptions] == undefined) ? scope.$parent[attrs.selectOptions] : scope.$parent.$parent[attrs.selectOptions],
            minimumResultsForSearch: (attrs.minResultsForSearch == 'Infinity') ? attrs.minResultsForSearch : parseInt(attrs.minResultsForSearch),
            theme: 'bootstrap',
            dropdownCssClass: (attrs.dropdownClass == undefined) ? '' : attrs.dropdownClass,
            language: {
                noResults: function(params) {
                    return 'No hay resultados para mostrar'
                }
            }
        };

        if(attrs.placeHolder != undefined) {
            params['placeholder'] = attrs.placeHolder;
        }

        angular.element(element).select2(params);

        if(ionic.Platform.isIOS()) {
            var e = angular.element(element).next();
            var parent = angular.element(element).parents('.content-container');

            // Remove select2 mousedown listener from element
            e.off('mousedown');

            // Implement toggle with click instead of mousedown
            e.on('click', function() {
                if (angular.element(element).select2('isOpen')) {
                    angular.element(element).select2('close');
                } else {
                    angular.element(element).select2('open');
                }
            });

            parent.on('click', function(event) {
                console.log(angular.element(e).has(event.target).length === 0);
                if(angular.element(e).has(event.target).length === 0) {
                    if (angular.element(element).select2('isOpen')) {
                        angular.element(element).select2('close');
                    }
                }
                console.log('hola');
            });
        }

        angular.element(element).on('select2:open', function(e) {
            angular.element('.select2-dropdown').css({
               'transform': 'scaleY(1)'
            });
        });

        angular.element(element).on('select2:closing', function(e) {
            var dropdown = angular.element('.select2-dropdown');

            if(dropdown.css('transform').split(',')[3] == 1) {
                dropdown.css({
                   'transform': 'scaleY(0)'
                });
                e.preventDefault();
                $timeout( function() {
                    angular.element(element).select2('close');
                }, 100);
            }
        });
    }
}
