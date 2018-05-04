"use strict";

angular.module('ThubanApp')

.controller('ItemsListController', ItemsListController);

ItemsListController.$inject = [
    '$scope',
    '$rootScope',
    'SearchServices',
    'itemsData'
];

function ItemsListController(
    $scope,
    $rootScope,
    SearchServices,
    itemsData
) {
    $scope.isTrayList = $rootScope.actualList.params.isTray;
    $scope.totalItemsCount = 0;

    if (itemsData != undefined) {
        $scope.items = itemsData.documents;
        $scope.totalItemsCount = itemsData.count;
    }

    $scope.loadMoreItems = function() {
        $rootScope.actualList.params.from = $rootScope.actualList.params.to;
        $rootScope.actualList.params.to = $rootScope.actualList.params.to + $rootScope.actualList.params.maxResults;

        SearchServices.getDocumentsByCriterias($rootScope.actualList.params)
        .then(function(data) {
            $scope.items = $scope.items.concat(data.documents);
            $scope.totalItemsCount = data.count;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
        .catch(function(error) {
            console.error(error);
        });
    };

    $scope.moreItemsCanBeLoaded = function() {
        if($scope.items && $scope.items.length < $scope.totalItemsCount) {
            return true;
        }

        return false;
    };
}
