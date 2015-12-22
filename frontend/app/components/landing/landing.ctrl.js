angular.module('tf-client')
.controller('LandingCtrl', function($localStorage) {
  var self = this;

  self.isTasker = function() {
    if ($localStorage.user) return $localStorage.user.roles[0] == 'tasker';
    else return false;
  };
});
