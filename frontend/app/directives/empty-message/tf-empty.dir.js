angular.module('tf-client')
.directive('tfEmpty', function() {
  return {
    restrict: 'E',
    scope: {
      tfMessage: '=',
      tfShow: '='
    },
    controller: function($scope) {
      var defaultMessage = 'No items were found';
      if (!$scope.tfMessage) $scope.tfMessage = defaultMessage;
      $scope.$watch("tfShow", function(newValue, oldValue) {
        if (newValue) {
          $scope.content = {
            message: $scope.tfMessage,
            error: false
          };
        }
        else $scope.content = undefined;
      });
    },
    templateUrl: 'directives/empty-message/tf-empty.html'
  };
});
