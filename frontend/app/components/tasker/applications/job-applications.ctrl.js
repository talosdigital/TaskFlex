angular.module('tf-client')
.controller('JobApplicationsCtrl', function($state, $stateParams, taskerService, authService,
                                            alertService) {
  var self = this;

  if (!authService.authorize(["tasker"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.currentPage = $stateParams.page;
  self.pages = 0;
  self.offers = [];
  self.showEmpty = false;
  self.withdrawing = -1;

  self.retrieveOffers = function(page) {
    taskerService.getMyOffers(page)
      .then(function(data) {
        self.offers = data.offers;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.showEmpty = self.offers.length === 0;
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                "Your current applications could not be retrieved");
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("Your information could not be retrieved");
            break;
        }
      });
  };

  self.retrieveOffers(self.currentPage);

  self.offerStatus = function(offer) {
    if (offer.status === 'ACCEPTED') return offer.status;
    else if (offer.status === 'REJECTED') return offer.status;
    else if (offer.status === 'WITHDRAWN') return offer.status;
    else if (offer.status === 'RETURNED') return offer.status;
    else return 'PENDING';
  };

  self.onPageChange = function(selectedPage) {
    $state.go($state.current, { page: selectedPage, alert: undefined });
  };

  self.viewDetails = function(offerId) {
    $state.go('taskerReply', { offer: offerId });
  };

  self.isWithdrawable = function(offerStatus) {
    return offerStatus === 'RETURNED' || offerStatus === 'SENT';
  };

  self.isResendable = function(offerStatus) {
    return offerStatus === 'RETURNED';
  };

  self.isSendable = function(offerStatus) {
    return offerStatus === 'CREATED';
  };

  self.toggleWithdrawing = function(offer) {
    self.withdrawing = offer;
  };

  self.withdrawOffer = function(offerId) {
    taskerService.updateOfferStatus(offerId, 'withdraw')
      .then (function (data) {
        var alert = alertService.buildSuccess("The offer was withdrawn successfully");
        $state.go($state.current, { alert: alert, page: self.currentPage });
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                               "The offer could not be withdrawn");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("The offer could not be withdrawn");
            break;
        }
      });
  };

  self.resendOffer = function(offerId) {
    taskerService.updateOfferStatus(offerId, 'resend')
      .then (function (data) {
        var alert = alertService.buildSuccess("The offer was resent successfully");
        $state.go($state.current, { alert: alert, page: self.currentPage });
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The offer could not be resent");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("The offer could not be resent");
            break;
        }
      });
  };

  self.sendOffer = function(offerId) {
    taskerService.updateOfferStatus(offerId, 'send')
      .then (function (data) {
        var alert = alertService.buildSuccess("The offer was sent successfully");
        $state.go($state.current, { alert: alert, page: self.currentPage });
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error, "The offer could not be sent");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("The offer could not be sent");
            break;
        }
      });
  };
});
