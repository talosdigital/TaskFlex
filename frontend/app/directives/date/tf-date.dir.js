angular.module('tf-client')
.directive('tfDate', function() {
  return {
    restrict: 'E',
    scope: {
      tfDateExpression: '=',
      tfDateFormat: '='
    },
    controller: function($scope) {
      var large = 'MMMM d/yyyy';
      var small = 'MMM d/yyyy';
      if ($scope.tfDateFormat) {
        if ($scope.tfDateFormat === 'small') $scope.format = small;
        else if ($scope.tfDateFormat === 'large') $scope.format = large;
        else $scope.format = $scope.tfDateFormat;
      }
      else $scope.format = large;
    },
    templateUrl: 'directives/date/tf-date.html'
  };
});
