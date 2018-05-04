"use strict";

angular.module('ThubanApp', ['ionic', 'ngCordova', 'LocalStorageModule', 'ngSanitize'])

.constant('WS_EXP_COD_RET', '98')
.constant('WS_ACC_COD_RET', '97')
.constant('WS_SUC_COD_RET', '00')
.constant('VALUES_SEPARATOR', '|')
.constant('VALUES_SEPARATOR_2', ',')

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/partials/menu.html',
        controller: 'AppController',
        adminServices: 'AdminServices',
        resolve: {
            menuRights: function($rootScope, AdminServices, $cordovaToast) {
                var params = {
                    section: 'TOOL',
                    rightName: 'CREATE'
                };

                $rootScope.menuAccessRights = {
                    create: false,
                    search: false,
                    trays: false
                };

                return AdminServices.getAccessRightForAction(params)
                .then(function(createAccess) {
                    $rootScope.menuAccessRights.create = createAccess;
                    params.rightName = 'SEARCH';
                    return AdminServices.getAccessRightForAction(params);
                })
                .then(function(searchAccess) {
                    $rootScope.menuAccessRights.search = searchAccess;
                    params.rightName = 'TRAY';
                    return AdminServices.getAccessRightForAction(params);
                })
                .then(function(traysAccess) {
                    $rootScope.menuAccessRights.trays = traysAccess;
                    return $rootScope.menuAccessRights;
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
            }
        }
    })

    .state('login', {
        url: '/login',
        cache: false,
        templateUrl: 'templates/pages/login.html',
        controller: 'LoginController'
    })

    .state('app.home', {
        url: '/home',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/home.html',
                controller: 'HomeController'
            }
        }
    })

    .state('app.create', {
        url: '/create',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/create.html',
                controller: 'CreateController'
            }
        },
        adminServices: 'AdminServices',
        resolve: {
            documentClasses: function(AdminServices, $cordovaToast, $ionicLoading) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                var params = {
                    forAction: "create"
                };

                return AdminServices.getDocumentClasses(params)
                .then(function(classes) {
                    return classes;
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
            }
        }
    })

    .state('app.search', {
        url: '/search',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/search.html',
                controller: 'SearchController'
            }
        },
        adminServices: 'AdminServices',
        resolve: {
            documentClasses: function(AdminServices, $cordovaToast, $ionicLoading) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                var params = {
                    forAction: "search"
                };

                return AdminServices.getDocumentClasses(params)
                .then(function(classes) {
                    return classes;
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
            }
        }
    })

    .state('app.trays', {
        url: '/trays',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/trays.html',
                controller: 'TraysController'
            }
        },
        trayServices: 'TrayServices',
        resolve: {
            trays: function(TrayServices, $cordovaToast, $ionicLoading) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                var params = {
                    includeWFTrays: true
                };

                return TrayServices.getUserTrays(params)
                .then(function(trays) {
                    return trays;
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
            }
        }
    })

    .state('app.item', {
        url: '/itemsList/:documentId',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/item.html',
                controller: 'ItemController'
            }
        },
        searchServices: 'SearchServices',
        adminServices: 'AdminServices',
        resolve: {
            item: function(SearchServices, AdminServices, $stateParams, $rootScope, $cordovaToast, $ionicLoading) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                var params = {
                    documentID: $stateParams.documentId,
                    allFields: true,
                    includeNotes: true,
                    includeHistory: true
                };

                var documentData = null;

                return SearchServices.getDocument(params)
                .then(function(data) {
                    documentData = data;
                    return AdminServices.getDocumentClassFields({ documentClass: documentData.document.docClass });
                })
                .then(function(classFields) {
                    $rootScope.actualList.classFields = {};

                    for (var i = 0; i < classFields.length; i++) {
                        $rootScope.actualList.classFields[classFields[i].id] = classFields[i];
                    }

                    return documentData;
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
            }
        }
    })

    .state('app.itemNotes', {
        url: '/itemsList/:documentId/itemNotes',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/item-notes.html',
                controller: 'ItemNotesController'
            }
        },
        adminServices: 'AdminServices',
        resolve: {
            notesRights: function($rootScope, $ionicLoading, $cordovaToast, AdminServices) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                var params = {
                    section: 'CLASS',
                    rightName: 'DOC_NOTES_ADD',
                    docClass: $rootScope.actualItem.docClass
                };

                var rights = {
                    add: false,
                    modifyOwn: false,
                    modifyAny: false
                };

                return AdminServices.getAccessRightForAction(params)
                .then(function(addNotesRight) {
                    rights.add = addNotesRight;
                    params = {
                        section: 'CLASS',
                        rightName: 'DOC_NOTES_MOD_OWN',
                        docClass: $rootScope.actualItem.docClass
                    };

                    return AdminServices.getAccessRightForAction(params);
                })
                .then(function(modifyOwnNoteRight) {
                    rights.modifyOwn = modifyOwnNoteRight;
                    params = {
                        section: 'CLASS',
                        rightName: 'DOC_NOTES_MOD_ANY',
                        docClass: $rootScope.actualItem.docClass
                    };

                    return AdminServices.getAccessRightForAction(params);
                })
                .then(function(modifyAnyNoteRight) {
                    rights.modifyAny = modifyAnyNoteRight;
                    return rights;
                })
                .catch(function(error) {
                    $cordovaToast.showShortBottom(error);
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
            }
        }
    })

    .state('app.itemsList', {
        url: '/itemsList',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/items-list.html',
                controller: 'ItemsListController'
            }
        },
        searchServices: 'SearchServices',
        trayServices: 'TrayServices',
        resolve: {
            itemsData: function(SearchServices, TrayServices, $rootScope, $cordovaToast, $ionicLoading) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                $rootScope.actualList.params.from = 0;
                $rootScope.actualList.params.to = 15;
                $rootScope.executreTrayDenied = false;

                if($rootScope.actualList.params.isTray) {
                    return TrayServices.executeTray($rootScope.actualList.params)
                    .then(function(data) {
                        return data;
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
                } else {
                    return SearchServices.getDocumentsByCriterias($rootScope.actualList.params)
                    .then(function(data) {
                        return data;
                    })
                    .catch(function(error) {
                        $cordovaToast.showShortBottom(error);
                    })
                    .finally(function() {
                        $ionicLoading.hide();
                    });
                }
            }
        }
    })

    .state('app.traysItemsList', {
        url: '/traysItemsList/:trayName',
        views: {
            "menuContent": {
                templateUrl: 'templates/pages/trays-items-list.html',
                controller: 'TraysItemsListController'
            }
        },
        trayServices: 'TrayServices',
        Utils: 'Utils',
        resolve: {
            itemsTrays: function(TrayServices, Utils, $rootScope, $stateParams, $cordovaToast, $ionicLoading, WS_ACC_COD_RET) {
                $ionicLoading.show({
                    content: 'Loading',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                $rootScope.executreTrayDenied = false;
                var tray = Utils.objectInNestedObjectsByName($rootScope.trayList.trays, $stateParams.trayName, "subTrays");

                if(typeof tray === "undefined") {
                    $cordovaToast.showShortBottom("Hubo un error en la búsqueda de la bandeja.");
                    $ionicLoading.hide();
                    return null;
                } else {
                    var result = {
                        trays: tray.subTrays,
                        items: null,
                        count: null
                    }

                    if(tray.hasContent) {
                        $rootScope.trayList.params.from = 0;
                        $rootScope.trayList.params.to = 15;
                        $rootScope.trayList.params.trayName = $stateParams.trayName;

                        return TrayServices.executeTray($rootScope.trayList.params)
                        .then(function(data) {
                            result.items = data.documents;
                            result.count = data.count
                            return result;
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
                    } else {
                        $ionicLoading.hide();
                        return result;
                    }
                }
            }
        }
    });

    $urlRouterProvider.otherwise('/login');
})

.run(function(
    $rootScope,
    $state,
    $ionicPlatform,
    $ionicHistory,
    $ionicPopup,
    localStorageService,
    $cordovaFile
) {

    $ionicPlatform.ready(function() {

        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            StatusBar.show();
            StatusBar.backgroundColorByName('black');
            StatusBar.styleLightContent();
        }

        if(ionic.Platform.isIOS()) {
            $rootScope.cacheDirectory = cordova.file.cacheDirectory;
            $rootScope.dataDirectory = cordova.file.dataDirectory;
        } else {
            $rootScope.cacheDirectory = cordova.file.externalCacheDirectory;
            $rootScope.dataDirectory = cordova.file.externalRootDirectory;
        }
    });

    $ionicPlatform.registerBackButtonAction(function (event) {
        var history = $ionicHistory.viewHistory();

        if(history.backView != null){
            if(history.backView.url == '/login'){
                var confirmPopup = $ionicPopup.confirm({
                    subTitle: '¿Seguro que desea salir?',
                    cancelText: 'Cancelar',
                    okText: 'Salir'
                });

                confirmPopup.then(function(res) {
                    if(res) {
                        $rootScope.token = null;

                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });

                        $state.go('login');
                    }
                });
            } else {
                navigator.app.backHistory();
            }
        } else {
            navigator.app.exitApp();
        }
    }, 101);

    var serverEndpoint = localStorageService.get('server');
    var username = localStorageService.get('lastUsername');

    if(serverEndpoint != null) {
        $rootScope.serverEndpoint = serverEndpoint;
    }

    if(username != null) {
        $rootScope.userName = username;
    }
});
