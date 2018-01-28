(function() {
    'use strict';

    angular
        .module('app.widgets.map', ['app.services', 'ui-leaflet'])
        .controller('MapController', MapController);

    MapController.$inject = ['$scope', '$timeout', 'leafletData', 'OHService'];
    function MapController($scope, $timeout, leafletData, OHService) {
        var vm = this;
        var itemStates = {};
        var accuracyStates = {};
        var ready = false;

        vm.center = {};

        vm.markers = {};
        vm.paths = {};

        activate();

        ////////////////

        function onResized() {
            leafletData.getMap().then(function(map) {
                $timeout(function() {
                    map.invalidateSize();
                }, 300);
            });
        }

        function updateValues() {
            leafletData.getMap().then(function(map) {
                $timeout(function () {
                    for (var i = 1; i <= 6; i++) {
                        if ($scope.config['item' + i]) {
                            var item = OHService.getItem($scope.config['item' + i]);
                            var accuracyItem = ($scope.config['showaccuracy' + i]) ? OHService.getItem($scope.config['accuracyitem' + i]) : null;

                            if (item && item.state.indexOf(',') && $scope.config['enabled' + i] === true &&
                                (item.state !== itemStates[item.name] || (accuracyItem && accuracyItem.state !== accuracyStates[accuracyItem.name]))) {
                                itemStates[item.name] = item.state;

                                if (!ready) {
                                    map.invalidateSize();
                                    ready = true;
                                }

                                var icon = {
                                    type: 'vectorMarker',
                                    prefix: 'glyphicon'
                                };

                                if ($scope.config['color' + i]) {
                                    icon.markerColor = $scope.config['color' + i];
                                }
                                if ($scope.config['icon' + i]) {
                                    icon.icon = $scope.config['icon' + i];
                                };

                                var lat = parseFloat(item.state.split(',')[0]);
                                var lng =  parseFloat(item.state.split(',')[1]);

                                if (isNaN(lat) || isNaN(lng)) {
                                    continue;
                                }

                                vm.markers[item.name] = {
                                    lat: parseFloat(item.state.split(',')[0]),
                                    lng: parseFloat(item.state.split(',')[1]),
                                    message: item.label,
                                    icon: icon
                                };

                                if (accuracyItem && accuracyItem.type === 'Number' && parseFloat(accuracyItem.state) > 0) {
                                    vm.paths[item.name] = {
                                        type: 'circle',
                                        radius: parseFloat(accuracyItem.state),
                                        latlngs: vm.markers[item.name],
                                        color: icon.markerColor,
                                        weight: 2
                                    };
                                    accuracyStates[accuracyItem.name] = accuracyItem.state;
                                }

                            }
                        }

                        var markersArray = [];
                        angular.forEach(vm.markers, function (marker) {
                            markersArray.push(marker);
                        });
                        map.fitBounds(markersArray, { maxZoom: $scope.config.zoom || null });
            }
                });
            });
        }

        function activate() {
            if ($scope.config.center_lat && $scope.config.center_lng && $scope.config.zoom) {
                vm.center.lat = parseFloat($scope.config.center_lat);
                vm.center.lng = parseFloat($scope.config.center_lng);
                vm.center.zoom = parseFloat($scope.config.zoom);
            }

            var resizedHandler = $scope.$on('gridster-resized', onResized);
            $scope.$on('$destroy', resizedHandler);
            OHService.onUpdate($scope, null, updateValues);

            onResized();
        }
    }
})();
