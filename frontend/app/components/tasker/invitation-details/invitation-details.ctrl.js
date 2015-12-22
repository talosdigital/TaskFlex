angular.module('tf-client')
.controller('InvitationDetailsCtrl', function($state, $stateParams, invitationService, authService,
                                              alertService) {
  var self = this;

  if (!authService.authorize(["tasker"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.invitationId = $stateParams.id;
  self.invitation = {};
  self.rejectConfirm = false;

  self.retrieveInvitation = function() {
    invitationService.getInvitation(self.invitationId)
      .then(function (data) {
        self.invitation = data;
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The invitation could not be retrieved");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("The invitation could not be retrieved");
            break;
        }
      });
  };

  self.retrieveInvitation();

  self.reply = function() {
    $state.go('taskerReply', { invitation: self.invitationId });
  };

  self.reject = function() {
    invitationService.updateInvitationStatus(self.invitationId, 'reject')
      .then(function(data) {
        var alert = alertService.buildSuccess("You've succesfully rejected the job invitation");
        $state.go('taskerInvitations', { alert: alert });
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your invitation could not be rejected");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("Your invitation could not be rejected");
            break;
        }
      });
  };

  self.toggleRejectConfirm = function() {
    self.rejectConfirm = !self.rejectConfirm;
  };

  self.accept = function() {
    $state.go('taskerReply', { invitation: self.invitationId, accepting: 'true' });
  };
});
