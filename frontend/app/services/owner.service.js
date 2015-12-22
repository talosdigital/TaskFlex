angular.module('tf-client-services')
.factory('ownerService', function($q, dolittle, resourceService) {

  function createOwner(attrs) {
    return resourceService.post('/auths/owner', dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({status: response.status, data: response.data});
      });
  }

  function getAllActiveJobs(attrs) {
    return resourceService.get('/jobs/all/owner', dolittle.to.snake(attrs))
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({status: response.status, data: response.data});
      });
  }

  function getCurrentJobs(page) {
    var query = { page: page };
    return resourceService.get('/jobs/current/owner', { params: dolittle.to.snake(query) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject(response.data);
      });
  }

  function getPastJobs(page) {
    var query = { page: page };
    return resourceService.get('/jobs/past/owner', { params: dolittle.to.snake(query) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject(response.data);
      });
  }

  function getJobById(jobId) {
    return resourceService.get('/owners/job/' + jobId, {})
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  function getCurrentTaskers(attrs) {
    return resourceService.get('/offers/current/taskers', { params: dolittle.to.snake(attrs) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data});
      });
  }

  function getPastTaskers(attrs) {
    return resourceService.get('/offers/past/taskers', { params: dolittle.to.snake(attrs) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data});
      });
  }

  function getPendingOffers(page) {
    var query = { page: page };
    return resourceService.get('/offers/owner', { params: dolittle.to.snake(query) })
    .then(function (response) {
      return dolittle.to.camel(response.data);
    }, function (response) {
      return $q.reject({ status: response.status, data: response.data });
    });
  }

  return {
    'createOwner': createOwner,
    'getCurrentJobs': getCurrentJobs,
    'getPastJobs': getPastJobs,
    'getJobById': getJobById,
    'getCurrentTaskers': getCurrentTaskers,
    'getPastTaskers': getPastTaskers,
    'getPendingOffers': getPendingOffers,
    'getAllActiveJobs': getAllActiveJobs
  };
});
