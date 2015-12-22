angular.module('tf-client')
.controller('ReplyOfferCtrl', function($state, $stateParams, offerService, authService,
                                       alertService) {
  var self = this;

  if (!authService.authorize(["owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.offer = {};
  self.offerId = $stateParams.offer;
  self.offerFound = true;
  self.records = [];
  self.invitation = undefined;
  self.reason = "";
  self.accepting = false;
  self.rejecting = false;

  self.retrieveOffer = function(offerId) {
    if (!offerId) {
      self.alert = alertService.buildError("The offer could not be found");
      self.offerFound = false;
      return;
    }
    offerService.getOffer(offerId)
      .then(function(data) {
        self.offer = data;
        self.records = self.offer.records;
        if (data.invitation) self.invitation = data.invitation.id ? data.invitation : undefined;
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
            self.alert = alertService.buildError("The offer could not be retrieved");
            break;
        }
      });
  };

  self.retrieveOffer(self.offerId);

  self.isTaskerRecord = function(record) {
    return record.recordType == 'CREATED' ||
           record.recordType == 'SENT' ||
           record.recordType == 'RESENT';
  };

  self.canReply = function() {
    return (self.offer.status == 'SENT' || self.offer.status == 'RESENT') &&
           !self.accepting && !self.rejecting;
  };

  self.reply = function(validForm) {
    if (!validForm) return;
    var params = {
      reason: self.reason
    };
    offerService.updateOfferStatus(self.offerId, 'return', params)
      .then(function(data) {
        var alert = alertService.buildSuccess("You've replied the offer successfully");
        $state.go('myOffers.currentOffers', { alert: alert });
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The offer could not be returned");
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("The offer could not be returned");
            break;
        }
      });
  };

  self.toggleAccepting = function() {
    self.accepting = !self.accepting;
  };

  self.accept = function() {
    offerService.updateOfferStatus(self.offerId, 'accept', {})
      .then(function(data) {
        $state.go('dealConfirmation', { id: data.id, offer: data });
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The offer could not be accepted");
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("The offer could not be accepted");
            break;
        }
      });
  };

  self.toggleRejecting = function() {
    self.rejecting = !self.rejecting;
  };

  self.decline = function() {
    offerService.updateOfferStatus(self.offerId, 'reject', {})
      .then(function(data) {
        var alert = alertService.buildSuccess("You've rejected the offer successfully");
        $state.go('myOffers.currentOffers', { alert: alert });
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The offer could not be rejected");
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("The offer could not be rejected");
            break;
        }
      });
  };
});
