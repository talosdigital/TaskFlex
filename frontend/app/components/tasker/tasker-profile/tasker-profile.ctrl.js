angular.module('tf-client')
.controller('TaskerProfileCtrl', function($stateParams, $state, $cookies, $localStorage,
                                          taskerService, authService, alertService) {
  var self = this;

  if (!authService.authorize(["", "tasker", "owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.taskerId = $stateParams.id;
  self.taskerFound = true;
  self.tasker = {};
  self.showEmpty = false;

  self.retrieveTasker = function(taskerId) {
    taskerService.getTaskerInfo({ id: taskerId })
      .then(function (data) {
        self.tasker = data;
        if (self.tasker.metadata && self.tasker.metadata.previousJobs) {
          self.showEmpty = self.tasker.metadata.previousJobs.length === 0;
        }
      }, function (response) {
        self.alert = alertService.buildError("The given tasker was not found");
        self.taskerFound = false;
      });
  };
  self.retrieveTasker(self.taskerId);

  self.isMyProfile = function() {
    if ($localStorage.user) return $localStorage.user.id == self.taskerId;
    else return false;
  };

  self.invite = function() {
    if ($cookies.get('token')) $state.go('invite', { tasker: self.tasker.id });
    else {
      var hiring = {
        firstName: self.tasker.firstName,
        lastName: self.tasker.lastName
      };
      var comeBack = {
        state: 'invite',
        params: {
          tasker: self.tasker.id
        }
      };
      $state.go('sign-up', { hiring: hiring , comeBack: comeBack, role: 'owner' });
    }
  };
});
