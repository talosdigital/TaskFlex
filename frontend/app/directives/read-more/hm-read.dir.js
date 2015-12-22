// Author: Hitesh Modha, Copyright (c) 2014.
// Source: https://github.com/hiteshmodha/angular-read-more
angular.module('tf-client')
.directive('hmRead', function () {
  return {
    restrict:'AE',
    scope:{
      hmtext : '@',
      hmlimit : '@',
      hmfulltext:'@',
        hmMoreText:'@',
        hmLessText:'@',
        hmMoreClass:'@',
        hmLessClass:'@'
    },
    templateUrl: 'directives/read-more/hm-read.html',
    transclude: true,
    controller: function($scope) {
      $scope.toggleValue = function() {
        //Inverts hmfulltext flag to either TRUE/FALSE on each click
        $scope.hmfulltext = !$scope.hmfulltext;
      }
    }
  };
});

// app.controller('readmoreCntroller',function($scope){
//   $scope.text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce non vulputate nisl. Curabitur placerat tincidunt nisl eu gravida. Phasellus vitae consequat neque, sed scelerisque ipsum. Nunc dictum consequat sem, tincidunt rhoncus orci hendrerit nec. Fusce vel dictum felis. Nam non risus nisl. Etiam fermentum ut ligula sed porta. Aenean consequat feugiat nulla at vulputate. Maecenas non risus nisl. Pellentesque dolor ex, venenatis at justo a, porttitor elementum mi. Etiam rutrum ac urna vitae egestas. Morbi efficitur ipsum nisi.";
//     //$scope.text="hj";
// });
