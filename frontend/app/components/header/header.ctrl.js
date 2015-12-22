angular.module('tf-client')
.controller('HeaderCtrl', function($cookies, $window, $scope, $localStorage, $state, userService,
                                   focusFactory, authService) {
  var self = this;
  self.menuOpen = false;
  self.infoOpen = false;
  self.searchOpen = false;
  self.searchText = "";
  self.subMenu = {
    'myOffers': {
      items: [
        {
          name: 'Current Offers',
          active: 'myOffers.currentOffers'
        },
        {
          name: 'Past Offers',
          active: 'myOffers.pastOffers'
        }
      ]
    },
    'myTaskers': {
      items: [
        {
          name: 'Current Taskers',
          active: 'myTaskers.currentTaskers'
        },
        {
          name: 'Past Taskers',
          active: 'myTaskers.pastTaskers'
        },
        {
          name: 'Find Taskers',
          active: 'myTaskers.findTasker'
        }
      ]
    },
    'myJobs': {
      items: [
        {
          name: 'Current Jobs',
          active: 'myJobs.currentJobs'
        },
        {
          name: 'Past Jobs',
          active: 'myJobs.pastJobs'
        },
        {
          name: 'Find Jobs',
          active: 'myJobs.availableJobs'
        }
      ]
    }
  };

  self.parentState = function() {
    if ($state.includes('myJobs')) return 'myJobs';
    if ($state.includes('myTaskers')) return 'myTaskers';
    if ($state.includes('myOffers')) return 'myOffers';
    return null;
  }

  self.isLoggedIn = function() {
    if ($cookies.get('token')) return true;
    else return false;
  };

  self.role = function() {
    if ($localStorage.user) return $localStorage.user.roles[0];
    else return null;
  };

  self.login = function() {
    // TODO: Maybe add here params: $stateParams.
    $state.go('login', { comeBack: { state: $state.current } });
    self.menuOpen = self.infoOpen = self.searchOpen = false;
  };

  self.signUp = function() {
    $state.go('role-choice');
    self.menuOpen = self.infoOpen = self.searchOpen = false;
  };

  self.logout = function() {
    userService.logout();
    $cookies.remove('token');
    $localStorage.$reset();
    self.menuOpen = self.infoOpen = self.searchOpen = false;
    // Reload current state so that if user is not allowed to stay there he will be
    // redirected if the state does redirect.
    // $state.go($state.current, {}, { reload: true });
    $state.go('landing', {});
  };

  self.myProfile = function() {
    self.menuOpen = self.infoOpen = self.searchOpen = false;
    if (!$localStorage.user) return;
    else if ($localStorage.user.roles[0] == 'owner') $state.go('myOffers.currentOffers', {});
    else $state.go('taskerProfile', { id: $localStorage.user.id });
  };

  self.goTo = function(state) {
    $state.go(state, {});
    self.menuOpen = self.infoOpen = self.searchOpen = false;
  };

  self.toggleInfo = function(event) {
    self.infoOpen = !self.infoOpen;
    if (self.infoOpen) {
      self.menuOpen = false;
      self.searchOpen = false;
    }
    // Stop propagation so that it doesn't call $window.onclick.
    if (event) event.stopPropagation();
  };

  self.toggleMenu = function(event) {
    self.menuOpen = !self.menuOpen;
    if (self.menuOpen) {
      self.infoOpen = false;
      self.searchOpen = false;
    }
    // Stop propagation so that it doesn't call $window.onclick.
    if (event) event.stopPropagation();
  };

  $window.onclick = function() {
    if (self.menuOpen) self.menuOpen = false;
    if (self.infoOpen) self.infoOpen = false;
    $scope.$apply();
  };

  self.toggleSearch = function(elementId) {
    self.searchOpen = !self.searchOpen;
    if (self.searchOpen && elementId) {
      self.infoOpen = false;
      self.menuOpen = false;
      focusFactory(elementId);
    }
  };

  self.searchPlaceHolder = function() {
    if (self.role() == 'tasker') return "Find a job...";
    else return "Find a tasker..."
  };

  self.search = function() {
    if (self.role() === 'tasker') $state.go('myJobs.availableJobs', { filter: self.searchText });
    else $state.go('myTaskers.findTasker', { filter: self.searchText });
    self.searchText = '';
  };

  self.user = function(field) {
    if ($localStorage.user) return $localStorage.user[field];
    else return null;
  };
});
