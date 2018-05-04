"user strict";

angular.module('ThubanApp')

.provider('ResourceServices', function() {

    this.$get = ['$q', '$rootScope', '$http', 'Utils', 'WS_EXP_COD_RET', 'WS_SUC_COD_RET', function($q, $rootScope, $http, Utils, WS_EXP_COD_RET, WS_SUC_COD_RET) {
        /****************/
        /* PRIVATE METHODS
        /****************/

        /**
        * Get the document resource
        * @param params: type Object. Contains:
        *                  Integer documentID
        * @return response object. Contains: data Object. Resource is data.resource
        */
        function getResource(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/getResource',
                contentType: "application/json; charset=utf-8",
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'documentID' : params.documentID
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    var extension = angular.lowercase(response.data.resource.extension);
                    var result = {
                        type: '',
                        stream: response.data.resource.stream,
                        extension: angular.lowercase(extension)
                    };

                    if(extension == 'png') {
                        result.type = 'image/png';
                    }

                    if(extension == 'txt') {
                        result.type = 'text/plain';
                    }

                    if(extension == 'jpg' || extension == 'jpeg') {
                        result.type = 'image/jpeg';
                    }

                    if(extension == 'pdf') {
                        result.type = 'application/pdf';
                    }

                    if(extension == 'doc' || extension == 'docx') {
                        result.type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    }

                    if(extension == 'ppt' || extension == 'pptx') {
                        result.type = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                    }

                    if(extension == 'xls' || extension == 'xlsx') {
                        result.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    }

                    deferred.resolve(result);
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
        * Get the document resource
        * @param params: type Object. Contains:
        *                  Integer documentID
        * @return response object. Contains: data.codRet and data.msg
        */
        function deleteResource(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/deleteResource',
                contentType: "application/json; charset=utf-8",
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'documentID' : params.documentID
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response);
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
            getResource: getResource,
            deleteResource: deleteResource
        }
    }];
});
