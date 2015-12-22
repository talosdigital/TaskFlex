angular.module('tf-client')
.controller('TaskerInvitationsCtrl', function($state, $stateParams, taskerService, authService,
                                              alertService) {
  var self = this;

  if (!authService.authorize(["tasker"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.currentPage = $stateParams.page;
  self.pages = 0;
  self.totalItems = 0;
  self.invitations = [];
  self.showEmpty = false;

  self.retrieveInvitations = function(page) {
    taskerService.getMyInvitations(page)
      .then(function(data) {
        self.invitations = data.invitations;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.totalItems = data.totalItems;
        self.showEmpty = self.invitations.length === 0;
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your invitations couldn't be retrieved");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("Your invitations couldn't be retrieved");
            break;
        }
      });
  };

  self.retrieveInvitations(self.currentPage);

  self.viewDetails = function(invitationId) {
    $state.go('invitationDetails', { id: invitationId });
  };

  self.onPageChange = function(selectedPage) {
    $state.go($state.current, { page: selectedPage });
  };
});
