angular.module('tf-client')
.controller('ResetPasswordCtrl', function($stateParams, $state, userService, authService,
                                          alertService) {
  var self = this;

  if (!authService.authorize([""], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.token = $stateParams.token;
  self.submitted = false;
  self.password = "";
  self.inputType = 'password';

  self.submit = function(validForm) {
    self.submitted = true;
    if (!validForm) return;
    userService.resetPassword(self.password, self.token)
      .then(function (data) {
        var alert = alertService.buildSuccess("Your password was resetted successfully");
        $state.go('login', { alert: alert });
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your password could not be changed");
            break;
          default:
            self.alert = alertService.buildError("Your password could not be changed");
            break;
        }
      });
  };

  self.toggleVisibility = function() {
    self.inputType = self.inputType === 'password' ? 'text' : 'password';
  };
});
