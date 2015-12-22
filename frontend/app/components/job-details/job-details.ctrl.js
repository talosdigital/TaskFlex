angular.module('tf-client')
.controller('JobDetailsCtrl', function($state, $stateParams, $localStorage, $cookies, jobService,
                                       ownerService, taskerService, authService, alertService) {
  var self = this;

  if (!authService.authorize(["owner", "tasker", ""], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.jobId = $stateParams.job;
  self.isMyJob = false;
  self.alreadyApplied = true;

  self.retrieveJob = function() {
    jobService.getJobById(self.jobId)
      .then(function (data) {
        self.job = data;
      }, function (response) {
        self.alert = alertService.buildError("The job could not be retrieved");
      });
  };

  self.retrieveJob();

  self.checkIfIsMyJob = function() {
    if ($cookies.get('token') && $localStorage.user) {
      if ($localStorage.user.roles[0] === 'owner') {
        ownerService.getJobById(self.jobId)
          .then(function (data) {
            self.isMyJob = true;
          });
      }
    }
  };

  self.checkIfIsMyJob();

  self.checkIfAlreadyApplied = function() {
    if ($cookies.get('token') && $localStorage.user) {
      if ($localStorage.user.roles[0] === 'tasker') {
        taskerService.getOfferJobById(self.jobId)
          .then(function (data) {
            self.alreadyApplied = true;
          }, function(response) {
            // Because no offer were found.
            self.alreadyApplied = false;
          });
      }
    }
    else self.alreadyApplied = false; // Because he is not logged in.
  };

  self.checkIfAlreadyApplied();

  self.apply = function() {
    $state.go('applyJob', { id: self.jobId });
  };

  self.edit = function() {
    $state.go('postJob', { edit: self.jobId });
  }
});
