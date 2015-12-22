angular.module('tf-client-services')
.factory('offerService', function($q, dolittle, resourceService) {

  function getOffer(offerId) {
    return resourceService.get('/offers/' + offerId, {})
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  function updateOfferStatus(id, action, params) {
    return resourceService.put('/offers/' + id + '/' + action, dolittle.to.snake(params))
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  function createOffer(attrs, acceptInvitation) {
    var params = attrs;
    params.accept = acceptInvitation;
    return resourceService.post('/offers', dolittle.to.snake(attrs))
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  return {
    'getOffer': getOffer,
    'updateOfferStatus': updateOfferStatus,
    'createOffer': createOffer
  };
});
