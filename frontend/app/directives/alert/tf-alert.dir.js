angular.module('tf-client')
.directive('tfAlert', function() {
  return {
    restrict: 'E',
    // ng-repeat has a priority of 1000, we need the compiler to process first the directive,
    // so we use more priority here.
    priority: 1001,
    scope: {
      tfContent: '='
    },
    templateUrl: 'directives/alert/tf-alert.html'
  };
});
