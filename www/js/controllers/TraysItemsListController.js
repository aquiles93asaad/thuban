"use strict";

angular.module('ThubanApp')

.controller('TraysItemsListController', TraysItemsListController);

TraysItemsListController.$inject = [
    '$scope',
    '$rootScope',
    '$stateParams',
    'TrayServices',
    'itemsTrays'
];

function TraysItemsListController(
    $scope,
    $rootScope,
    $stateParams,
    TrayServices,
    itemsTrays
) {
    $scope.totalItemsCount = 0;

    if(typeof itemsTrays !== 'undefined') {
        $scope.items = itemsTrays.items;
        $scope.trays = itemsTrays.trays;
        $scope.totalItemsCount = itemsTrays.count;
        $scope.trayName = $stateParams.trayName.replace('%20', ' ');
    }

    $scope.noResultsMessage = function() {
        if((typeof $scope.items === 'undefined' && typeof $scope.trays === 'undefined')|| (typeof $scope.items === 'undefined' && angular.equals($scope.trays, {}))) {
            return true;
        }

        return false;
    }

    $scope.loadMoreItems = function() {
        $rootScope.trayList.params.from = $rootScope.trayList.params.to;
        $rootScope.trayList.params.to = $rootScope.trayList.params.to + $rootScope.trayList.params.maxResults;

        TrayServices.executeTray($rootScope.trayList.params)
        .then(function(data) {
            $scope.items = $scope.items.concat(data.documents);
            $scope.totalItemsCount = data.count;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
        .catch(function(error) {
            if(error.codRet == WS_ACC_COD_RET) {
                $rootScope.executreTrayDenied = true;
            }

            $cordovaToast.showShortBottom(error.msg);
        })
        .finally(function() {
            $ionicLoading.hide();
        });
    };

    $scope.moreItemsCanBeLoaded = function() {
        if($scope.items && $scope.items.length < $scope.totalItemsCount) {
            return true;
        }

        return false;
    };
}
