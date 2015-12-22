angular.module('tf-client-services')
.factory('authService', function($cookies, $localStorage, $state, $stateParams) {

  function loggedIn() {
    return $cookies.get('token') !== undefined && $localStorage.user !== undefined;
  }

  function currentRole() {
    if (!$localStorage.user || $localStorage.user.length === 0) return '';
    return $localStorage.user.roles[0];
  }

  function authorize(roles, params) {
    if (roles.indexOf(currentRole()) === -1) {
      if (loggedIn()) $state.go('landing', {});
      else {
        var alert = {
          message: 'Please log in before proceeding.',
          error: false
        };
        var comeBack = {
          state: $state.current,
          params: params
        };
        $state.go('login', { alert: alert, comeBack: comeBack });
      }
      return false;
    }
    else return true;
  }

  return {
    'loggedIn': loggedIn,
    'currentRole': currentRole,
    'authorize': authorize
  };
});
