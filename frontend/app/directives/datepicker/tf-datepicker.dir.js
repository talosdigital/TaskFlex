angular.module('tf-client')
.directive('tfDatepicker', function() {
  return {
    restrict: 'E',
    scope: {
      tfModel: '=',
      tfModelString: '=',
      tfFormat: '=',
      tfMinDate: '=',
      tfMaxDate: '=',
      tfName: '=',
      tfRequired: '='
    },
    controller: function($scope, $filter) {
      $scope.open = function() {
        $scope.status.opened = true;
      }

      $scope.dateOptions = {
        startingDay: 1
      };

      $scope.status = {
        opened: false,
      };

      if (angular.isUndefined($scope.tfFormat)) $scope.tfFormat = 'yyyy-MM-dd';

      $scope.$watch("tfModel", function(newValue, oldValue) {
        $scope.tfModelString = $filter('date')(newValue, $scope.tfFormat);
      });
    },
    templateUrl: 'directives/datepicker/tf-datepicker.html'
  };
});
