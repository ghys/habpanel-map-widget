(function() {
    'use strict';

    angular
        .module('app.widgets.map', ['app.services', 'ui-leaflet'])
        .controller('MapController', MapController);

    MapController.$inject = ['$scope', '$timeout', 'leafletData', 'OHService'];
    function MapController($scope, $timeout, leafletData, OHService) {
        var vm = this;
        var itemStates = {};
        var ready = false;

        vm.center = {
            lat: parseFloat($scope.config.center_lat),
            lng: parseFloat($scope.config.center_lng),
            zoom: parseFloat($scope.config.zoom)
        };

        vm.markers = {};

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

                            if (item && item.state.indexOf(',') && $scope.config['enabled' + i] === true && item.state !== itemStates[item.name]) {
                                itemStates[item.name] = item.state;

                                if (!ready) {
                                    map.invalidateSize();
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
                            }
                        }
                    }
                });
            });
        }

        function activate() {
            var resizedHandler = $scope.$on('gridster-resized', onResized);
            $scope.$on('$destroy', resizedHandler);
            OHService.onUpdate($scope, null, updateValues);

            onResized();
        }
    }
})();
