angular.module('tf-client')
.controller('CurrentOffersCtrl', function($stateParams, $state, ownerService, authService,
                                          alertService) {
  var self = this;

  if (!authService.authorize(["owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.pages = 0;
  self.currentPage = $stateParams.page;
  self.jobs = [];
  self.showEmpty = false;

  self.retrieveJobs = function(page) {
    ownerService.getCurrentJobs(page)
      .then(function (data) {
        self.jobs = data.jobs;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.showEmpty = self.jobs.length === 0;
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your current jobs couldn't be retrieved");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("Your current jobs couldn't be retrieved");
            break;
        }
      });
  };

  self.retrieveJobs(self.currentPage);

  self.showTaskers = function(status, jobId) {
    var params = {
      status: status,
      job: jobId
    };
    $state.go('myTaskers.currentTaskers', params);
  };

  self.onPageChange = function(selectedPage) {
    $state.go($state.current, { page: selectedPage });
  };
});
