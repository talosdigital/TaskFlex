angular.module('tf-client')
.controller('DealConfirmationCtrl', function($state, $stateParams, offerService, authService,
                                             alertService) {
  var self = this;

  if (!authService.authorize(["owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.offer = $stateParams.offer;
  self.offerId = $stateParams.id;
  self.offerFound = true;
  self.job = {};

  self.shouldRetrieveOffer = function(offerId) {
    if (self.offer) {
      self.job = self.offer.job;
      return false;
    }
    if (!offerId) {
      self.offerFound = false;
      self.alert = alertService.buildError("The offer could not be retrieved");
      return false;
    }
    return true;
  };

  self.retrieveOffer = function(offerId) {
    if (!self.shouldRetrieveOffer(offerId)) return;
    offerService.getOffer(offerId)
      .then(function(data) {
        self.offer = data;
        self.job = data.job;
      }, function(response) {
        self.offerFound = false;
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The offer could not be retrieved");
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("The offer could bot be retrieved");
            break;
        }
      });
  };

  self.retrieveOffer(self.offerId);
});
