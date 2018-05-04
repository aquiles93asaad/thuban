'use strict';

angular.module('ThubanApp')

.controller('SearchController', SearchController);

SearchController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$compile',
    '$timeout',
    '$cordovaToast',
    '$ionicLoading',
    'SearchServices',
    'AdminServices',
    'Utils',
    'documentClasses',
];

function SearchController(
    $scope,
    $rootScope,
    $state,
    $compile,
    $timeout,
    $cordovaToast,
    $ionicLoading,
    SearchServices,
    AdminServices,
    Utils,
    documentClasses
) {
    if(typeof documentClasses !== 'undefined') {
        var searchableFields = [];
        var fieldsKeysNames = {};
        var anotherMenuItem = false;

        $scope.searchOptions = [
            {id: 'equals', text: '=', 'selected': true},
            {id: 'distinct', text: '<>'},
            {id: 'greaterThanOrEquals', text: '>='},
            {id: 'greaterThan', text: '>'},
            {id: 'lesserThanOrEquals', text: '<='},
            {id: 'lesserThan', text: '<'},
            {id: 'any', text: '*'}
        ];

        if(ionic.Platform.isIOS()) {
            $scope.iosSearchOptions = [
                {id: 'distinct', text: '<>'},
                {id: 'greaterThanOrEquals', text: '>='},
                {id: 'greaterThan', text: '>'},
                {id: 'lesserThanOrEquals', text: '<='},
                {id: 'lesserThan', text: '<'},
                {id: 'any', text: '*'}
            ];
        }

        /*
         * $scope.search.documentClasses is object of the documentClasses with key/value pairs
         *      keys will be numbers starting from 0, and values will be the objects documentClasses obtained from the service
         * $scope.docClassesViews is array of objects {id: int, text: documentClassAlias/documentClassId } for the select2 plugin
        */
        $scope.search = {
            documentClasses: {},
            chosenDocumentClassId: null,
            chosenDocumentClassAlias: null,
            chosenDocumentClassViewId: null
        };
        $scope.docClassesViews = [];

        Utils.processObjectsArrayForSelectOptions(documentClasses, $scope.docClassesViews, $scope.search.documentClasses, 'alias', 'classID');

        initVariables();
    }

    function initVariables() {
        $scope.classFields = null;
        $scope.searchCriterias = {
            criterias: {},
            fields: {}
        };

        if(ionic.Platform.isIOS()) {
            $scope.searchCriterias.criterias
        }

        $scope.searchCriterias.orCriteria = false;
        $scope.advancedSearch = {
            show: false,
            exists: false
        };
        $scope.isIOS = ionic.Platform.isIOS();
        searchableFields = [];
        fieldsKeysNames = {};
    }

    function chooseOption(value, selectId) {
        var options = angular.element(selectId).find('option');
        for(var i = 0; i < options.length; i++) {
            if(angular.element(options[i]).attr('value') == value) {
                angular.element(options[i]).attr('selected', true)
            } else {
                angular.element(options[i]).attr('selected', false);
            }
        }

        $timeout(function() {
            angular.element(selectId).triggerHandler('change');
        }, 0);
    }

    $scope.loadFields = function () {
        $scope.search.chosenDocumentClassId = $scope.search.documentClasses[$scope.search.chosenDocumentClassViewId].classID;
        $scope.search.chosenDocumentClassAlias = $scope.search.documentClasses[$scope.search.chosenDocumentClassViewId].alias;

        if ($scope.search.chosenDocumentClassId != null && $scope.search.chosenDocumentClassId.trim() != '') {
            initVariables();

            $ionicLoading.show({
                content: 'Loading',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });

            var params = {
                documentClass: $scope.search.chosenDocumentClassId
            };

            AdminServices.getDocumentClassFields(params)
            .then(function(classFields) {
                $scope.classFields = classFields;

                for (var i = 0; i < classFields.length; i++) {
                    fieldsKeysNames[classFields[i].id] = classFields[i];

                    if(classFields[i].searchIndex == 'secondary') {
                        $scope.advancedSearch.exists = true;
                    }

                    if(classFields[i].searchable) {
                        searchableFields.push(classFields[i].id);
                    }

                    if(ionic.Platform.isIOS()) {
                        $scope.searchCriterias.criterias[classFields[i].id] = 'equals';
                        console.log(angular.element('#criteria_' + classFields[i].id));
                        angular.element('#criteria_' + classFields[i].id).trigger('change');
                        angular.element('#criteria_' + classFields[i].id).val('equals');
                    }
                }
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

    $scope.showField = function(searchIndex) {
        if(searchIndex == 'noIndexes') {
            return false;
        }

        if(searchIndex == 'primary') {
            return true;
        }

        if(searchIndex == 'secondary') {
            if($scope.advancedSearch.show) {
                return true;
            } else {
                return false;
            }
        }
    };

    $scope.populateSelectField = function(event, field) {
        event.preventDefault();

        var fakeSelect = angular.element(event.target);

        SearchServices.getMultivaluedFieldValues(field, true)
        .then(function(values) {
            $scope[field.id + '-options'] = [];

            if(values != null && values.length != 0) {
                Utils.processObjectsArrayForSelectOptions(values, $scope[field.id + '-options'], {}, '', '');
            }

            var parent = fakeSelect.parent();
            var html = '';
            html += '<select my-select2 class="my-select2" ng-model="searchCriterias.fields[\'' + field.id + '\']" place-holder="" select-options="' + field.id + '-options' + '" min-results-for-search="20" style="width: 100%">';
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

    $scope.searchAllCharacter = function(fieldKey) {
        if($scope.searchCriterias.fields[fieldKey] == '*' || $scope.searchCriterias.fields[fieldKey] == '%') {
            $scope.searchCriterias.fields[fieldKey] = '%';
            chooseOption('any', '#criteria_' + fieldKey);
        }
    };

    $scope.searchDocuments = function() {
        var searchFields = [];
        var searchField = {};
        var searchableHasValue = false;

        angular.forEach($scope.searchCriterias.fields, function(value, key) {
            if(value != '' && value != null) {
                if(value == '*') {
                    $scope.searchCriterias.criterias[key] = 'any';
                }

                searchField = {
                    'fieldData': {
                        'key': key,
                        'value': (value == '*') ? '%' : (fieldsKeysNames[key].dataType == 'date') ? moment(value).format('YYYYMMDD HH:mm:ss') : value,
                        'dataType': fieldsKeysNames[key].dataType
                    },
                    'criteria': ($scope.searchCriterias.criterias[key] != undefined) ? $scope.searchCriterias.criterias[key] : 'equals'
                }
                searchFields.push(searchField);

                if(searchableFields.indexOf(key) > -1) {
                    searchableHasValue = true;
                }
            }
        });

        if(searchableHasValue) {
            $rootScope.actualList.params.documentClass = $scope.search.chosenDocumentClassId;
            $rootScope.actualList.params.orCriteria = $scope.searchCriterias.orCriteria;
            $rootScope.actualList.params.queryFields = searchableFields;
            $rootScope.actualList.params.searchCriterias = searchFields;
            $rootScope.actualList.params.isTray = false;
            $rootScope.actualList.documentClassAlias = $scope.search.chosenDocumentClassAlias;

            $state.go('app.itemsList');
        } else {
            $cordovaToast.showShortBottom('Complete al menos uno de los criterios obligatorios de búsqueda.');
        }
    };

    $rootScope.$on('$menuItemChanged', function() {
        if($state.current.name != 'app.search') {
            anotherMenuItem = true;
        }
    });

    $rootScope.$on('$ionicView.leave', function() {
        if(anotherMenuItem) {
            if(typeof $scope.search !== 'undefined') {
                $scope.search.chosenDocumentClassId = null;
                $scope.search.chosenDocumentClassAlias = null;
                $scope.search.chosenDocumentClassViewId = null;
                initVariables();
                anotherMenuItem = false;
            }
        }
    });
}
