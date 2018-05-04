'user strict';

angular.module('ThubanApp')

.provider('DocumentServices', function() {

    this.$get = ['$q', '$rootScope', '$http', 'Utils', 'WS_EXP_COD_RET', 'WS_SUC_COD_RET', function($q, $rootScope, $http, Utils, WS_EXP_COD_RET, WS_SUC_COD_RET) {
        /****************/
        /* PRIVATE METHODS
        /****************/

        /**
        * Creates a document in Thuban server
        * @param params: type Object. Contains:
        *                            documentClass String
        *                            fields Object
        *                            resourrce InputStream
        * @returns response object. Contains: data.codret and data.msg
        */
        function createDocument(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/createDocument',
                data: {
                    'tokenAuthentication': $rootScope.token,
                    'documentClass': params.documentClass,
                    'fields': params.fields,
                    'resource': (params.resource) ? params.resource : undefined
                }
            })
            .then(function(response) {
                if(response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data);
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
        * Updates the document in Thuban server
        * @param params: type Object. Contains:
        *                            documentID String
        *                            fields Object
        *                            resourrce InputStream
        * @returns response object. Contains: data.codret and data.msg
        */
        function updateDocument(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/updateDocument',
                data: {
                    'tokenAuthentication': $rootScope.token,
                    'documentID': params.documentID,
                    'fields': params.fields,
                    'resource': (params.resource) ? params.resource : undefined
                }
            })
            .then(function(response) {
                if(response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data);
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
        * locks the document for potential update.
        * @param params: type Object. Contains:
        *                  Integer documentID
        * @returns response object. Contains: data.codret and data.msg
        */
        function lockDocument(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/lockDocument',
                data: {
                    'tokenAuthentication': $rootScope.token,
                    'documentID': params.documentID
                }
            })
            .then(function(response) {
                if(response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data);
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
        * Create, modify or delete a note of a document
        * @param params: type Object. Contains:
        *                            documentID String
        *                            action String: 'A' to create, 'M' to modify, 'D' to delete
        *                            note object
        * @returns response object. Contains: data.codret and data.msg
        */
        function noteAMD(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/thubanNoteAMD',
                data: {
                    'tokenAuthentication': $rootScope.token,
                    'documentID': params.documentID,
                    'action': params.action,
                    'note': params.note
                }
            })
            .then(function(response) {
                if(response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data.msg);
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
        /****************/
        /* PUBLIC METHODS
        /****************/
        return {
            createDocument: createDocument,
            updateDocument: updateDocument,
            lockDocument: lockDocument,
            noteAMD: noteAMD
        }
    }];
});
