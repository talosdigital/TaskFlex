angular.module('tf-client-services')
.factory('jobService', function($q, dolittle, resourceService) {

  function getAvailableJobs(filter, page) {
    query = {
      query: filter,
      page: page
    };
    return resourceService.get('/jobs/active', { params: dolittle.to.snake(query) })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  function searchJob(query, page) {
    params = {
      query: query,
      page: page
    };
    return resourceService.get('/jobs/search', { params: dolittle.to.snake(params) } )
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ data: response.data, status: response.stats });
      });
  };

  function createJob(attrs) {
    // The back-end receives the 'activate' parameter, which will automatically activate the job
    // once created. The back-end will set it to true as default.
    return resourceService.post('/jobs', dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ data: response.data, status: response.status});
      });
  }

  function createAndInvite(jobAttrs, invitationAttrs) {
    var params = jobAttrs;
    params.invitation = invitationAttrs;
    return resourceService.post('/jobs/invite', dolittle.to.snake(params))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ data: response.data, status: response.status});
      });
  }

  function updateJob(id, attrs) {
    return resourceService.put('/jobs/' + id, dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ data: response.data, status: response.status});
      });
  }

  function updateJobStatus(jobId, action) {
    return resourceService.put('/jobs/' + jobId + '/' + action, {})
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject(response.data);
      });
  }

  function getJobById(jobId) {
    return resourceService.get('/jobs/' + jobId, {})
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: dolittle.to.camel(response.data) });
      });
  }

  return {
    'getAvailableJobs': getAvailableJobs,
    'searchJob': searchJob,
    'createJob': createJob,
    'createAndInvite': createAndInvite,
    'updateJob': updateJob,
    'updateJobStatus': updateJobStatus,
    'getJobById': getJobById
  };
});
