'user strict';

angular.module('ThubanApp')

.provider('AdminServices', function() {

    this.$get = ['$q', '$rootScope', '$http', 'Utils', 'WS_EXP_COD_RET', 'WS_SUC_COD_RET', function($q, $rootScope, $http, Utils, WS_EXP_COD_RET, WS_SUC_COD_RET) {
        /****************/
        /* PRIVATE METHODS
        /****************/

        /**
        * Gets a temporary token to be used for all interactions with server
        * @param params: type Object. Contains:
        *                               username String
        *                               password String
        * @returns response object. Contains: data object. Token is data.msg
        */
        function getToken(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/thubanLogin',
                data: {
                    'user': params.user,
                    'password': window.btoa(params.password)
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data);
                } else {
                    deferred.reject(response.data.msg.indexOf('BadCredentials') != -1 ?
                    'El nombre de usuario y/o clave es incorrecta' :
                    response.data.msg);
                }
            })
            .catch(function(errorResponse) {
                deferred.reject('Error de conexión, intente nuevamente en unos minutos');
            });

            return deferred.promise;
        }

        /**
        * Get the classes of the user logged.
        * @param params: type Object. Contains: forAction String
        * @returns response object. Contains: data object. classes array is data.classes
        */
        function getDocumentClasses(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/getUserDocumentClasses',
                data: {
                    'tokenAuthentication': $rootScope.token,
                    'forAction': params.forAction,
                    'mobileRequest': true
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data.classes);
                } else if (response.data.codRet == WS_EXP_COD_RET) {
                    Utils.goToLoginPage();
                    deferred.reject(response.data.msg);
                } else {
                    deferred.reject(response.data.msg);
                }
            })
            .catch(function(errorResponse) {
                deferred.reject(errorResponse);
            });

            return deferred.promise;
        }

        /**
        * Get a document class configured fields.
        * @param params: type Object. Contains: documentClass String
        * @return response object. Contains: data Object. Fields are data.classFields
        */
        function getDocumentClassFields(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/getDocumentClassFields',
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'documentClass' : params.documentClass
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data.classFields);
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
        * gets the acces right for an action on a document or for a general action.
        * @param params: type Object. Contains:
        *                               docClass String
        *                               section String
        *                               rightName String
        * @return response object. Contains: data Object. access is data.hasAccess
        */
        function getAccessRightForAction(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/userHasAccess',
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'app' : 'THUBAN',
                    'section': params.section,
                    'rightName': params.rightName,
                    'docClass' : (params.docClass) ? params.docClass : undefined
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data.hasAccess);
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

        /****************/
        /* PUBLIC METHODS
        /****************/
        return {
            getToken: getToken,
            getDocumentClasses: getDocumentClasses,
            getDocumentClassFields: getDocumentClassFields,
            getAccessRightForAction: getAccessRightForAction
        }
    }];
});
