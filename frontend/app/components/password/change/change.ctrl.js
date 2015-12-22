angular.module('tf-client')
.controller('ChangePasswordCtrl', function($stateParams, $state, userService, authService,
                                           alertService) {
  var self = this;

  if (!authService.authorize(["tasker", "owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.submitted = false;
  self.currentInputType = 'password';
  self.newInputType = 'password';
  self.user = {};

  self.submit = function(validForm) {
    self.submitted = true;
    if (!validForm) return;
    userService.changePassword(self.user)
      .then(function (data) {
        self.alert = alertService.buildSuccess("Password has changed successfully");
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 'Your password could not be changed');
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError('Your password could not be changed');
        }
      });
  };

  self.toggleCurrentVisibility = function() {
    self.currentInputType = self.currentInputType === 'password' ? 'text' : 'password';
  };

  self.toggleNewVisibility = function() {
    self.newInputType = self.newInputType === 'password' ? 'text' : 'password';
  };
});
