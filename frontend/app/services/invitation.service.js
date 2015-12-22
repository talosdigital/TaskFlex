angular.module('tf-client-services')
.factory('invitationService', function($q, dolittle, resourceService) {

  function createInvitation(attrs) {
    return resourceService.post('/invitations', dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject(response.data);
      });
  }

  function createAndSendInvitation(attrs) {
    return resourceService.post('/invitations/send', dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject(response.data);
      });
  }

  function getInvitation(invitationId) {
    return resourceService.get('/invitations/' + invitationId)
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function updateInvitationStatus(invitationId, action) {
    return resourceService.put('/invitations/' + invitationId + '/' + action)
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  return {
    'createInvitation': createInvitation,
    'createAndSendInvitation': createAndSendInvitation,
    'getInvitation': getInvitation,
    'updateInvitationStatus': updateInvitationStatus
  };
});
