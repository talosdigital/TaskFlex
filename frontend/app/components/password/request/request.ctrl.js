angular.module('tf-client')
.controller('RequestPasswordCtrl', function($stateParams, userService, authService, alertService) {
  var self = this;

  if (!authService.authorize([""], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.submitted = false;
  self.email = "";

  self.submit = function(validForm) {
    self.submitted = true;
    if (!validForm) return;
    userService.requestResetPassword(self.email)
      .then(function (data) {
        self.alert = alertService.buildSuccess("Reset link sent to your email");
        self.email = "";
        self.submitted = false;
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "A new password could not be requested");
            break;
          default:
            self.alert = alertService.buildError("A new password could not be requested");
            break;
        }
      });
  };
});
