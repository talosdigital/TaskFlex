angular.module('tf-client')
.controller('FindTaskerCtrl', function($stateParams, taskerService, authService, alertService) {
  var self = this;

  if (!authService.authorize(["", "owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.showEmpty = false;
  self.taskers = [];
  self.filter = $stateParams.filter;

  self.applyFilter = function(filter) {
    taskerService.getAvailableTaskers(filter)
      .then(function (data) {
        self.taskers = data;
        self.showEmpty = Object.keys(self.taskers).length === 0;
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The taskers could not be found");
            break;
          default:
            self.alert = alertService.buildError("The taskers could not be found");
        }
      });
  };

  self.applyFilter(self.filter);
});
