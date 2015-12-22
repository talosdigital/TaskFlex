angular.module('tf-client-services.resource', ['ngCookies'])
.constant("TF_API", {
  host: undefined,
  port: 81,
  protocol: undefined
});

angular.module('tf-client-services', ['dolittle',
                                      'tf-client-services.resource']);

angular.module('tf-client', ['ui.router', 'tf-client-services', 'ngCookies',
                             'ui.bootstrap', 'ngStorage'])
.config(function($urlRouterProvider) {
  // when there is an empty route, redirect to landing
  $urlRouterProvider.when('', '/');
  $urlRouterProvider.otherwise('/not-found');
});
