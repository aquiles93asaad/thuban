"user strict";

angular.module('ThubanApp')

.provider('SearchServices', function() {

    this.$get = [
        '$q',
        '$http',
        '$timeout',
        '$rootScope',
        '$ionicLoading',
        'Utils',
        'WS_EXP_COD_RET',
        'WS_SUC_COD_RET',
        'VALUES_SEPARATOR',
        'VALUES_SEPARATOR_2',

        function(
            $q,
            $http,
            $timeout,
            $rootScope,
            $ionicLoading,
            Utils,
            WS_EXP_COD_RET,
            WS_SUC_COD_RET,
            VALUES_SEPARATOR,
            VALUES_SEPARATOR_2
        ) {
        /****************/
        /* PRIVATE METHODS
        /****************/

        /**
        * Get document data using its id
        * @param params: type Object. Contains:
        *                  Integer documentID
        *                  Boolean allFields
        *                  Boolean includeNotes
        * @return response object. Contains: data Object. Document is data.values
        */
        function getDocument(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/getDocument',
                contentType: "application/json; charset=utf-8",
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'documentID' : params.documentID,
                    'allFields' : params.allFields,
                    'includeNotes' : params.includeNotes,
                    'includeHistory' : params.includeHistory
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data);
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
        * Get n documents of a document class that match the criterias.
        * @param params: type Object. Contains:
        *                  String documentClass
        *                  Boolean orCriteria
        *                  Array of Strings queryFields
        *                  Array of Objects searchCriterias
        *                  Integer from
        *                  Integer to
        *                  Integer maxResults
        *                  String sortField
        *                  String sortDirection
        * @return response object. Contains: data Object. documents are data.documents
        */
        function getDocumentsByCriterias(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/searchDocuments',
                contentType: "application/json; charset=utf-8",
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'documentClass' : params.documentClass,
                    'orCriteria': params.orCriteria,
                    'queryFields': params.queryFields,
                    'searchCriterias': params.searchCriterias,
                    'from': params.from,
                    'to': params.to,
                    'maxResults': params.maxResults,
                    'sortField': params.sortField,
                    'sortDirection': params.sortDirection
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET || response.data.codRet == "10") {
                    deferred.resolve(response.data);
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
        * Gets the keys and values for multivalued type. Parses the string if it's "VALUES", or get the values from server for other types.
        * @param field object
        * @param isSearch boolean
        * @returns response object or empty String
        */
        function getMultivaluedFieldValues(field, isSearch) {
            var deferred = $q.defer();
            var multivaluedType = field.multivalued.substring(0, field.multivalued.indexOf(':'));
            var values = field.multivalued.substring(field.multivalued.indexOf(':') + 1, field.multivalued.length);

            if(multivaluedType == 'VALUES') {
                $timeout( function() {
                    var result = null;
                    if(values.indexOf(VALUES_SEPARATOR) != -1) {
                        result = values.split(VALUES_SEPARATOR);
                    } else {
                        result = values.split(VALUES_SEPARATOR_2);
                    }
                    
                    deferred.resolve(result);
                }, 100);
            } else {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                var params = {
                    documentClass: field.classID,
                    fieldID: (typeof field.id !== 'undefined') ? field.id : field.key,
                    isSearch: isSearch,
                    auxFields: ((multivaluedType == 'SQL') ? Utils.getMultivaluedFieldAuxFields(values) : '')
                };

                getMultivaluedFieldValuesService(params)
                .then(function(values) {
                    deferred.resolve(values);
                })
                .catch(function(error) {
                    deferred.reject(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                })
            }

            return deferred.promise;
        }

        /**
        * Get n values of a multivalued field, when it's workflow of sql
        * @param params: type Object. Contains:
        *                  String documentClass
        *                  Integer documentID
        *                  Integer fieldID
        *                  Boolean isSearch
        *                  Array of Objects auxFields
        * @return response object. Contains: data Object. Values are  data.values
        */
        function getMultivaluedFieldValuesService(params) {
            var deferred = $q.defer();

            $http({
                method: 'POST',
                url: $rootScope.serverEndpoint + 'jsonServices/getMultivaluedFieldValues',
                data: {
                    'tokenAuthentication' : $rootScope.token,
                    'documentClass' : params.documentClass,
                    'documentID' : ((params.documentID) ? params.documentID : ''),
                    'fieldID' : params.fieldID,
                    'isSearch' : params.isSearch,
                    'auxFields' : ((params.auxFields) ? params.auxFields : [])
                }
            })
            .then(function(response) {
                if (response.data.codRet == WS_SUC_COD_RET) {
                    deferred.resolve(response.data.values);
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
            getDocument: getDocument,
            getDocumentsByCriterias: getDocumentsByCriterias,
            getMultivaluedFieldValues: getMultivaluedFieldValues
        }
    }];
});
