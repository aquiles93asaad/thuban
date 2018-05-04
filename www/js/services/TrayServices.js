'user strict';

angular.module('ThubanApp')

.provider('TrayServices', function() {

    this.$get = ['$q', '$rootScope', '$http', 'Utils', 'WS_EXP_COD_RET', 'WS_SUC_COD_RET', function($q, $rootScope, $http, Utils, WS_EXP_COD_RET, WS_SUC_COD_RET) {
        /****************/
        /* PRIVATE METHODS
        /****************/

        /**
        * Get trays of the user.
        * @param params: type Object. Contains: Boolean includeWFTrays
        * @return response object. Contains: data Object. Fields are data.classFields
        */
        function getUserTrays(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/getUserTrays',
                contentType: 'application/json; charset=utf-8',
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'includeWFTrays' : params.includeWFTrays
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET || response.data.codRet == '10') {
                    deferred.resolve(response.data.userTrays);
                } else if (response.data.codRet == WS_EXP_COD_RET) {
                    Utils.goToLoginPage();
                    deferred.reject(response.data.msg);
                } else {
                    deferred.reject(response.data.msg);
                }
            })
            .catch(function (errorResponse) {
                deferred.reject(errorResponse);
            });

            return deferred.promise;
        }

        /**
        * Get documents of a spectific tray.
        * @param params: type Object. Contains:
        *                  String trayType
        *                  String trayName
        *                  String wfName
        *                  String documentClaass
        *                  String statusName
        *                  Integer from
        *                  Integer to
        *                  Integer maxResults
        *                  String sortField
        *                  String sortDirection
        * @return response object. Contains: data Object. Fields are data.classFields
        */
        function executeTray(params) {
            var deferred = $q.defer();
            var data = {};

            if(params.trayType == 'ThubanTray') {
                data = {
                    'trayName': params.trayName
                };
            } else {
                data = {
                    'classId': params.documentClass,
                    'wfName': params.wfName,
                    'statusName': params.statusName
                }
            }

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/executeTray',
                contentType: 'application/json; charset=utf-8',
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'trayToExecute' : {
                        'Type': params.trayType,
                        'Data': data
                    },
                    'from': params.from,
                    'to': params.to,
                    'maxResults': params.maxResults,
                    'sortField': params.sortField,
                    'sortDirection': params.sortDirection
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET || response.data.codRet == '10') {
                    deferred.resolve(response.data);
                } else if (response.data.codRet == WS_EXP_COD_RET) {
                    Utils.goToLoginPage();
                    deferred.reject(response.data);
                } else {
                    deferred.reject(response.data);
                }
            })
            .catch(function (errorResponse) {
                deferred.reject(errorResponse);
            });

            return deferred.promise;
        }


        /****************/
        /* PUBLIC METHODS
        /****************/
        return {
            getUserTrays: getUserTrays,
            executeTray: executeTray
        }
    }];
});
