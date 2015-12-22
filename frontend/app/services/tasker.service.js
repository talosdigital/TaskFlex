angular.module('tf-client-services')
.factory('taskerService', function($q, dolittle, resourceService) {
  function getAvailableTaskers(filter) {
    params = { firstName: filter, lastName: filter };
    return resourceService.get('/taskers', { params: dolittle.to.snake(params) } )
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject(dolittle.to.camel(response.data));
      });
  }

  function createTasker(attrs) {
    return resourceService.post('/auths/tasker', dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getTaskerInfo(attrs) {
    return resourceService.get('/taskers/' + attrs.id)
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getCurrentJobs(page) {
    var query = { page: page };
    return resourceService.get('/jobs/current/tasker', { params: dolittle.to.snake(query) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getPastJobs(page) {
    var query = { page: page };
    return resourceService.get('/jobs/past/tasker', { params: dolittle.to.snake(query) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getOfferJobById(jobId) {
    return resourceService.get('/taskers/job/' + jobId, {})
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getMyInfo() {
    return resourceService.get('/taskers/me', {})
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function(response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function updateMyInfo(attrs) {
    return resourceService.put('/taskers', dolittle.to.snake(attrs))
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function(response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getMyOffers(page) {
    var query = { page: page };
    return resourceService.get('/offers/tasker', { params: dolittle.to.snake(query) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function(response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function updateOfferStatus(offerId, action) {
    return resourceService.put('/offers/' + offerId + '/' + action)
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getMyInvitations(page) {
    var query = { page: page };
    return resourceService.get('/invitations/tasker', { params: dolittle.to.snake(query) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) })
      });
  }

  return {
    'getAvailableTaskers': getAvailableTaskers,
    'createTasker': createTasker,
    'getTaskerInfo': getTaskerInfo,
    'getCurrentJobs': getCurrentJobs,
    'getPastJobs': getPastJobs,
    'getOfferJobById': getOfferJobById,
    'getMyInfo': getMyInfo,
    'updateMyInfo': updateMyInfo,
    'getMyOffers': getMyOffers,
    'updateOfferStatus': updateOfferStatus,
    'getMyInvitations': getMyInvitations
  };
});
