angular.module('tf-client-services.resource')
.factory('resourceService', function($http, $cookies, $location, TF_API) {

  function apiProtocol() {
    return TF_API.protocol || $location.protocol();
  }

  function apiHost() {
    return TF_API.host || $location.host();
  }

  function apiPort() {
    return TF_API.port || $location.port();
  }

  function apiUrl() {
    return new URI("")
      .protocol(apiProtocol())
      .hostname(apiHost())
      .port(apiPort()).toString();
  }

  function get(url, config) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    var headers = $cookies.get('token');
    config.headers['User-Token'] = headers;
    return $http.get(apiUrl() + url, config);
  }

  function getExternal(url, config) {
    return $http.get(url, config);
  }

  function post(url, data, config) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    var headers = $cookies.get('token');
    config.headers['User-Token'] = headers;
    return $http.post(apiUrl() + url, data, config);
  }

  function put(url, data, config) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    var headers = $cookies.get('token');
    config.headers['User-Token'] = headers;
    return $http.put(apiUrl() + url, data, config);
  }

  function del(url, config) {
    if (!config) config = {};
    if (!config.headers) config.headers = {};
    var headers = $cookies.get('token');
    config.headers['User-Token'] = headers;
    return $http.delete(apiUrl() + url, config);
  }

  return {
    'get': get,
    'getExternal': getExternal,
    'post': post,
    'put': put,
    'delete': del
  };
});
