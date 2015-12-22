angular.module('tf-client')
.controller('CurrentTaskersCtrl', function($state, $stateParams, ownerService, authService,
                                           alertService) {
  var self = this;

  if (!authService.authorize(["owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.pages = 0;
  self.currentPage = $stateParams.page;
  self.status = $stateParams.status;
  self.jobId = $stateParams.job;
  self.items = [];
  self.showEmpty = false;

  self.retrieveCurrentTaskers = function() {
    var params = { page: self.currentPage, status: self.status.toUpperCase() };
    if (self.jobId != '') params.jobId = self.jobId;
    ownerService.getCurrentTaskers(params)
      .then(function(data) {
        self.items = data.offers;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.showEmpty = self.items.length === 0;
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your taskers could not be fetched");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("Your taskers could not be fetched");
            break;
        }
      });
  };

  self.retrieveCurrentTaskers();

  self.isActiveStatus = function(status) {
    return self.status.toUpperCase() === status.toUpperCase();
  };

  self.changeStatus = function(status) {
    if (status == self.status) self.status = '';
    else self.status = status;
    self.loadChange(1, self.jobId);
  };

  self.loadChange = function(page, jobId) {
    var params = {
      page: page,
      job: jobId,
      status: self.status
    };
    $state.go($state.current, params);
  };

  self.onPageChange = function(selectedPage) {
    self.loadChange(selectedPage, self.jobId);
  };

  self.viewProfile = function (taskerId) {
    $state.go('taskerProfile', { id: taskerId });
  };
});
