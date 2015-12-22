angular.module('tf-client')
.controller('PastTaskersCtrl', function($state, $stateParams, ownerService, authService,
                                        alertService) {
  var self = this;

  if (!authService.authorize(["owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.pages = 0;
  self.currentPage = $stateParams.page;
  self.items = [];
  self.showEmpty = false;

  self.retrievePastTaskers = function() {
    var params = { page: self.currentPage };
    ownerService.getPastTaskers(params)
      .then(function(data) {
        self.items = data.offers;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.showEmpty =  self.items.length === 0;
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your taskers could not be fetched")
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

  self.retrievePastTaskers();

  self.viewProfile = function (taskerId) {
    $state.go('taskerProfile', { id: taskerId });
  };

  self.onPageChange = function(selectedPage) {
    var params = {
      page: selectedPage
    };
    $state.go($state.current, params);
  };
});
