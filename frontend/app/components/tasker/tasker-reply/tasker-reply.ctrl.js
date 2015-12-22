angular.module('tf-client')
.controller('TaskerReplyCtrl', function($state, $stateParams, offerService, invitationService,
                                        categoryService, authService, alertService) {
  var self = this;

  if (!authService.authorize(["tasker"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.offer = {};
  self.offerId = $stateParams.offer;
  self.invitationId = $stateParams.invitation;
  self.offerFound = true;
  self.invitationFound = true;
  self.records = [];
  self.invitation = undefined;
  self.accepting = $stateParams.accepting;
  self.job = {};
  self.owner = {};
  self.tasker = {};
  self.reason = "";

  self.retrieveOffer = function(offerId) {
    offerService.getOffer(offerId)
      .then(function(data) {
        self.offer = data;
        self.job = data.job;
        self.records = data.records;
        self.owner = data.owner;
        self.tasker = data.tasker;
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

  self.retrieveInvitation = function(invitationId) {
    invitationService.getInvitation(invitationId)
      .then(function(data) {
        self.invitation = data;
        self.job = data.job;
        self.owner = data.owner;
        self.offer.metadata = self.job.metadata;
        if (self.accepting) {
          self.reason = "Hello " + self.owner.firstName + ". I would like to work with you, " +
                        "accepting your job conditions.\nThanks a lot."
        }
      }, function(response) {
        self.invitationFound = false;
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The invitation could not be retrieved");
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("The invitation could not be retrieved");
            break;
        }
      });
  };

  if (self.offerId) {
    self.retrieveOffer(self.offerId);
    self.invitationFound = false;
  }
  else if (self.invitationId) {
    self.retrieveInvitation(self.invitationId);
    self.offerFound = false;
  }
  else {
    self.alert = alertService.buildError("The offer could not be found");
    self.invitationFound = self.offerFound = false;
  }

  self.isTaskerRecord = function(record) {
    return record.recordType == 'CREATED' ||
           record.recordType == 'SENT' ||
           record.recordType == 'RESENT';
  };

  self.canReply = function() {
    if (self.offerFound && self.offer) return self.offer.status == 'RETURNED';
    else if (self.invitationFound && self.invitation) return self.invitation.status == 'SENT'
    return false;
  };

  self.reply = function(validForm) {
    if (!validForm) return;
    var params = {
      reason: self.reason,
      metadata: self.offer.metadata
    };
    offerService.updateOfferStatus(self.offerId, 'resend', params)
      .then(function(data) {
        var alert = alertService.buildSuccess("You've replied the offer successfully");
        $state.go('jobApplications', { alert: alert });
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

  self.makeAnOffer = function(validForm) {
    if (!validForm) return;
    var params = {
      jobId: self.job.id,
      invitationId: self.invitationId,
      description: self.reason,
      metadata: self.offer.metadata
    };
    offerService.createOffer(params, true)
      .then(function(data) {
        var alert = alertService.buildSuccess("You've " + (self.accepting ? "accepted": "replied") +
                                              " the invitation successfully");
        $state.go('taskerReply', { alert: alert, offer: data.id, invitation: undefined });
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                        "The invitation could not be " + (self.accepting ? 'accepted' : 'replied'));
            break;
          case 401:
            $state.go("landing", {});
            break;
          default:
            self.alert = alertService.buildError("The invitation could not be " +
                                                 (self.accepting ? 'accepted' : 'replied'));
            break;
        }
      });
  }

  self.cancel = function() {
    if (self.offerFound) $state.go('jobApplications', {});
    else {
      if (self.invitation && self.invitation.id) {
        $state.go('invitationDetails', { id: self.invitation.id });
      }
      else {
        $state.go('taskerInvitations', {});
      }
    }
  };
});
