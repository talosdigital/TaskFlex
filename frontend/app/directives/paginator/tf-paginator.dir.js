angular.module('tf-client')
.directive('tfPaginator', function() {
  return {
    restrict: 'E',
    scope: {
      tfCurrent: '=',
      tfMaxPage: '=',
      tfOnChange: '='
    },
    controller: function($scope) {
      makePages();

      function makePages() {
        $scope.pages = [];
        for (var i = 0; $scope.tfMaxPage && i < $scope.tfMaxPage; ++i) {
          var page = {
            click: $scope.tfClick + '(' + (i + 1) + ')',
            text: (i + 1)
          }
          $scope.pages.push(page);
        }
      };

      $scope.$watch("tfMaxPage", function(newValue, oldValue) {
        makePages();
      });

      $scope.changePage = function(index) {
        if (index == $scope.tfCurrent) return;
        $scope.tfOnChange(index);
      };
    },
    templateUrl: 'directives/paginator/tf-paginator.html'
  };
});
