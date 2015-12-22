angular.module('tf-client-services')
.factory('userService', function($q, dolittle, resourceService) {
  function login(attrs) {
    return resourceService.post('/auths/login', dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  function logout() {
    return resourceService.delete('/auths/logout')
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  function changePassword(attrs) {
    return resourceService.put('/auths/update_password', dolittle.to.snake(attrs))
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ data: response.data, status: response.status});
      });
  }

  function currentUser() {
    return resourceService.get('/auths/current')
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  function requestResetPassword(email) {
    return resourceService.post('/auths/reset_password/request', { email: email })
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  function resetPassword(password, token) {
    var params = {
      password: password,
      verifyToken: token
    };
    return resourceService.put('/auths/reset_password', dolittle.to.snake(params))
      .then(function (response) {
        return dolittle.to.camel(response.data);
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  }

  return {
    'login': login,
    'changePassword': changePassword,
    'currentUser': currentUser,
    'logout': logout,
    'requestResetPassword': requestResetPassword,
    'resetPassword': resetPassword
  };
});
