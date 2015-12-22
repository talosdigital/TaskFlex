angular.module('tf-client')
.controller('OfferRepliesCtrl', function($state, $stateParams, ownerService, authService,
                                         alertService) {
  var self = this;

  if (!authService.authorize(["owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.pages = 0;
  self.currentPage = $stateParams.page;
  self.offers = [];
  self.showEmpty = false;

  self.retrieveOffers = function(page) {
    ownerService.getPendingOffers(page)
      .then(function (data) {
        self.offers = data.offers;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.showEmpty = self.offers.length === 0;
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Pending offers could not be retrieved")
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("Pending offers could not be retrieved");
            break;
        }
      });
  };

  self.retrieveOffers(self.currentPage);

  self.reply = function(offerId) {
    $state.go('offerReply', { offer: offerId });
  };

  self.onPageChange = function(selectedPage) {
    $state.go($state.current, { page: selectedPage, alert: undefined });
  };
});
