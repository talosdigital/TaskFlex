angular.module('tf-client')
.controller('RoleChoiceCtrl', function($state, authService) {
  var self = this;

  if (!authService.authorize([""])) return;

  self.hire = function() {
    $state.go('sign-up', { role: 'owner' });
  };

  self.work = function() {
    $state.go('sign-up', { role: 'tasker' });
  };
});
