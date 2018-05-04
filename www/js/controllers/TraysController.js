"use strict";

angular.module('ThubanApp')

.controller('TraysController', TraysController);

TraysController.$inject = [
    '$scope',
    '$rootScope',
    '$state',
    '$cordovaToast',
    'AdminServices',
    'trays'
];

function TraysController(
    $scope,
    $rootScope,
    $state,
    $cordovaToast,
    AdminServices,
    trays
) {
    if(typeof trays !== 'undefined') {
        $scope.wfTrays = [];
        $scope.thubanTrays = [];
        var wfTrays = {};
        var thubanTrays = {};
        var subTrays = [];
        var trayAdded = false;

        for (var i = 0; i < trays.length; i++) {
            var actualTray = trays[i];

            if(actualTray.Type == 'WFTray') {
                var documentClassName = '';

                if(actualTray.Data.classAlias != null && actualTray.Data.classAlias != '') {
                    documentClassName = actualTray.Data.classAlias;
                } else {
                    documentClassName = actualTray.Data.classId;
                }

                if(wfTrays.hasOwnProperty(actualTray.Data.wfName)) {
                    if(wfTrays[actualTray.Data.wfName].documentClasses.hasOwnProperty(documentClassName)) {
                        wfTrays[actualTray.Data.wfName].documentClasses[documentClassName].trays.push(actualTray);
                    } else {
                        wfTrays[actualTray.Data.wfName].documentClasses[documentClassName] = {
                            name: documentClassName,
                            trays: [actualTray]
                        };
                    }
                } else {
                    var wfToAdd = {name: actualTray.Data.wfName, documentClasses: {}};

                    wfToAdd.documentClasses[documentClassName] = {
                        name: documentClassName,
                        trays: [actualTray]
                    };

                    wfTrays[wfToAdd.name]= wfToAdd;
                }
            } else {
                if((typeof actualTray.Data.father === 'undefined') || (typeof actualTray.Data.father !== 'undefined' && actualTray.Data.father == '') || (typeof actualTray.Data.father !== 'undefined' && actualTray.Data.father == actualTray.Data.trayName)) {
                    if(!thubanTrays.hasOwnProperty(actualTray.Data.trayName)) {
                        thubanTrays[actualTray.Data.trayName] = {
                            trayName: actualTray.Data.trayName,
                            hasContent: !actualTray.Data.noContent,
                            count: actualTray.Data.count,
                            subTrays: {}
                        };
                    }
                } else {
                    if(!addSubTrayToTrays(thubanTrays, actualTray)) {
                        subTrays.push(actualTray);
                    }
                }
            }
        }

        // These variables ensure that the while loop won't be infinite
        var originalLength = subTrays.length;
        var counter = 0;

        while(subTrays.length != 0 && counter < originalLength) {
            addRestSubTrays();
            counter++;
        }

        // if for some reason the subTrays array still has some trays to put with their tray parents that aren't parth of the response array, they're added manually
        if(subTrays.length != 0) {
            for (var i = 0; i < subTrays.length; i++) {
                var actualSubTray = {
                    trayName: subTrays[i].Data.trayName,
                    hasContent: !subTrays[i].Data.noContent,
                    count: subTrays[i].Data.count,
                    subTrays: {}
                };

                if(!thubanTrays.hasOwnProperty(subTrays[i].Data.father)) {
                    thubanTrays[subTrays[i].Data.father] = {
                        trayName: subTrays[i].Data.father,
                        hasContent: false,
                        count: 0,
                        subTrays: {}
                    }
                }
                
                thubanTrays[subTrays[i].Data.father].subTrays[subTrays[i].Data.trayName] = actualSubTray;
            }
        }

        for (var wf in wfTrays) {
            if (wfTrays.hasOwnProperty(wf)) {
                $scope.wfTrays.push(wfTrays[wf]);
            }
        }

        $rootScope.trayList.trays = thubanTrays;

        for (var thubanTray in thubanTrays) {
            if (thubanTrays.hasOwnProperty(thubanTray)) {
                $scope.thubanTrays.push(thubanTrays[thubanTray]);
            }
        }
    }

    $scope.executeTray = function(tray) {
        $rootScope.actualList.documentClassAlias = tray.Data.classAlias;
        $rootScope.actualList.params.documentClass = tray.Data.classId;
        $rootScope.actualList.params.isTray = true;
        $rootScope.actualList.params.documentClass = tray.Data.classId;
        $rootScope.actualList.params.trayName = tray.Data.trayName;
        $rootScope.actualList.params.wfName = tray.Data.wfName;
        $rootScope.actualList.params.statusName = tray.Data.statusName;

        $state.go('app.itemsList');
    };

    function addRestSubTrays() {
        for (var i = 0; i < subTrays.length; i++) {
            if(addSubTrayToTrays(thubanTrays, subTrays[i])) {
                subTrays.splice(i, 1);
            }
            trayAdded = false;
        }
    }

    function addSubTrayToTrays(thTrays, tray) {
        if(thTrays.hasOwnProperty(tray.Data.father)) {
            thTrays[tray.Data.father].subTrays[tray.Data.trayName] = {
                trayName: tray.Data.trayName,
                hasContent: !tray.Data.noContent,
                count: tray.Data.count,
                subTrays: {}
            };
            return true;
        } else {
            for (var thTray in thTrays) {
                if (thTrays.hasOwnProperty(thTray)) {
                    if(!angular.equals(thTrays[thTray].subTrays, {})) {
                        trayAdded = addSubTrayToTrays(thTrays[thTray].subTrays, tray);
                    }
                }

                if(trayAdded) {
                    break;
                }
            }
            return trayAdded;
        }
    }
}
