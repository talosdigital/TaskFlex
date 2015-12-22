angular.module('tf-client')
.controller('SignUpCtrl', function($stateParams, $state, $cookies, $localStorage, taskerService,
                                   ownerService, facebookService, userService, authService,
                                   alertService) {
  var self = this;

  if (!authService.authorize([""], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.hiring = $stateParams.hiring;
  self.posting = $stateParams.posting;
  self.passwordInputType = "password";
  self.role = $stateParams.role ? $stateParams.role : 'tasker'; // Default role is tasker.

  // TODO: Request those fields.
  self.user = { birthDate: "1995-01-01", gender: "male" };
  self.submitted = false;

  self.logout = function() {
    userService.logout();
    $cookies.remove('token');
    $localStorage.$reset();
  };

  self.submit = function(validForm) {
    self.submitted = true;
    if (validForm) {
      var promise;
      if (self.role == 'owner') promise = ownerService.createOwner(self.user);
      else promise = taskerService.createTasker(self.user);
      promise.then(function (data) {
        self.goToLogin('You have successfully signed up.', false);
      }, function (response) {
        var data = response.data;
        self.alert = alertService.buildError(data.error,
                                             "An error ocurred while trying to sign up");
      });
    }
  };

  self.togglePasswordVisibility = function() {
    self.passwordInputType = self.passwordInputType === 'password' ? 'text' : 'password';
  };

  self.goToLogin = function(alertMessage, alertError) {
    var alert;
    if (alertMessage && alertMessage != '') {
      alert = alertService.buildCustom(alertMessage, alertError);
    }
    var params = {
      email: self.user.email,
      comeBack: $stateParams.comeBack
    };
    if (alert) params.alert = alert;
    $state.go('login', params);
  };

  self.facebook = function() {
    facebookService.login(self.role)
    .then(function (data) {
      $cookies.put('token', data.token);
      self.storeUserInformation();
    }, function (response) {
      self.alert = alertService.buildError(response.data.error,
                                          "An error ocurred while trying to sign up with Facebook");
    })
  };

  self.storeUserInformation = function() {
    userService.currentUser()
      .then(function (data) {
        $localStorage.user = data;
        if ($stateParams.comeBack) self.handleComeBack();
        else self.redirectRole();
      }, function (response) {
        self.logout();
        self.alert = alertService.buildError("An error ocurred while trying to sign up");
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
