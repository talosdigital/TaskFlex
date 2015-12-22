angular.module('tf-client-services')
.factory('locationsService', function($q, resourceService) {

  function getCountries() {
    return resourceService.getExternal('https://restcountries.eu/rest/v1/all')
      .then(function (response) {
        return response.data;
      }, function (response) {
        return $q.reject(response.data);
      });
  }

  // Removes extra information that we don't need and returns only the important information about
  // the given country
  function countryInfo(country) {
    var newCountry = {
      alpha3Code: country.alpha3Code,
      name: country.name,
      callingCodes: country.callingCodes
    };
    return newCountry;
  }

  return {
    'getCountries': getCountries,
    'countryInfo': countryInfo
  };
});
