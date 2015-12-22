angular.module('tf-client')
.controller('CurrentJobsCtrl', function($stateParams, $state, taskerService, authService,
                                        alertService) {
  var self = this;

  if (!authService.authorize(["tasker"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.pages = 0;
  self.currentPage = $stateParams.page;
  self.jobs = [];
  self.showEmpty = false;

  self.retrieveJobs = function(page) {
    taskerService.getCurrentJobs(page)
      .then(function (data) {
        self.jobs = data.jobs;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.showEmpty = self.jobs.length === 0;
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your jobs could not be retrieved");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("Your jobs could not be retrieved");
            break;
        }
      });
  };

  self.retrieveJobs(self.currentPage);

  self.onPageChange = function(selectedPage) {
    $state.go($state.current, { page: selectedPage });
  };
});
