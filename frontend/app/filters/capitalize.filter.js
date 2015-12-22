angular.module('tf-client')
.filter('capitalize', function() {
  return function(input) {
    if (input) input = input.toLowerCase();
    else input = "";
    return input.substring(0, 1).toUpperCase() + input.substring(1);
  }
});
