angular.module('tf-client-services')
.factory('categoryService', function($q, dolittle, resourceService) {

  function getCategories() {
    return resourceService.get('/categories')
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data });
      });
  };

  function getCategory(keyword, destination) {
    return resourceService.get('/categories/' + keyword)
      .then(function (response) {
        return { data: dolittle.to.camel(response.data), destination: destination };
      }, function (response) {
        return $q.reject({ status: response.status, data: response.data, destination: destination});
      });
  }

  return {
    'getCategories': getCategories,
    'getCategory': getCategory
  };
});
