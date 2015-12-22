angular.module('tf-client')
.directive('tfTasker', function() {
  return {
    restrict: 'E',
    // ng-repeat has a priority of 1000, we need the compiler to process first the directive,
    // so we use more priority here.
    priority: 1001,
    scope: {
      tasker: '='
    },
    templateUrl: 'directives/tasker/tf-tasker.html'
  };
});
