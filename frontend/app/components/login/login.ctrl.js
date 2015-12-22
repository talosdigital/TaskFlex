angular.module('tf-client')
.controller('LoginCtrl', function($state, $stateParams, $cookies, $localStorage, userService,
                                  authService, alertService) {
  var self = this;

  if (!authService.authorize([""], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.user = { remember: false, email: $stateParams.email };
  self.submitted = false;

  self.logout = function() {
    userService.logout();
    $cookies.remove('token');
    $localStorage.$reset();
  };

  if ($stateParams.expired) self.logout();

  self.submit = function(validForm) {
    self.submitted = true;
    if (validForm) {
      userService.login(self.user)
        .then(function (data) {
          $cookies.put('token', data.token);
          self.storeUserInformation();
        }, function (response) {
          var data = response.data;
          self.alert = alertService.buildError(data.error, 'Login failed, please try again');
        });
    }
  };

  self.storeUserInformation = function() {
    userService.currentUser()
      .then(function (data) {
        $localStorage.user = data;
        if ($stateParams.comeBack) self.handleComeBack();
        else self.redirectRole();
      }, function (response) {
        self.logout();
        self.alert = alertService.buildError('An error occurred while trying to log in')
      });
  };

  self.handleComeBack = function() {
    // Go back to a page depending on the role instead of going landing.
    if ($stateParams.comeBack.state == 'landing' || $stateParams.comeBack.state.name == 'landing') {
      self.redirectRole();
    }
    else {
      var params = $stateParams.comeBack.params;
      if (params) params = angular.merge(params, { alert: undefined });
      $state.go($stateParams.comeBack.state, params);
    }
  };

  self.redirectRole = function() {
    if (!$stateParams.comeBack) $stateParams.comeBack = {};
    if ($localStorage.user.roles[0] == 'owner') {
      $state.go('myTaskers.findTasker', $stateParams.comeBack.params);
    }
    else {
      $state.go('myJobs.availableJobs', $stateParams.comeBack.params);
    }
  };
});
