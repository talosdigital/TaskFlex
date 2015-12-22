angular.module('tf-client-services')
.factory('facebookService', function($q, dolittle, resourceService) {

  function login(role) {
    var deferred = $q.defer();
    FB.login(function(response) {
      if (response.status === 'connected') {
        var params = {
          token: response.authResponse.accessToken,
          role: role
        };
        return resourceService.post('/auths/facebook', params)
          .then(function (data) {
            deferred.resolve(dolittle.to.camel(data.data));
          }, function (data) {
            return deferred.reject({ status: data.status, data: data.data });
          });
      }
      else if (response.status === 'not_authorized') {
        return deferred.reject({ status: 0, data: { error: 'Please log into the Facebook application' }});
      }
      else {
        return deferred.reject({ status: 0, data: { error: 'Please log into Facebook' }});
      }
    }, { 'scope': 'email'});

    return deferred.promise;
  }

  return {
    'login': login
  };
});
