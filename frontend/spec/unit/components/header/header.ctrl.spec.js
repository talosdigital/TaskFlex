describe('HeaderCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, localStorage, cookies, state, windowMock, focusFactoryMock;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    localStorage = {
      $reset: function() { }
    };
    cookies = {
      get: function() { },
      remove: function() { }
    };
    state = {
      go: function() { },
      includes: function() { }
    };
    windowMock = { };
    focusFactoryMock = function() { };
    self = $controller('HeaderCtrl', {
      $scope: scope,
      $localStorage: localStorage,
      $cookies: cookies,
      $window: windowMock,
      $state: state,
      focusFactory: focusFactoryMock
    });
  }));

  describe('self.menuOpen', function() {
    it('is set to false by default', function() {
      expect(self.menuOpen).toBeFalsy();
    });
  });

  describe('self.infoOpen', function() {
    it('is set to false by default', function() {
      expect(self.infoOpen).toBeFalsy();
    });
  });

  describe('self.searchOpen', function() {
    it('is set to false by default', function() {
      expect(self.searchOpen).toBeFalsy();
    });
  });

  describe("self.searchText", function () {
    it("is a empty string by default", function () {
      expect(self.searchText).toEqual("");
    });
  });

  describe('self.subMenu', function() {
    it('has "myOffers", "myTaskers" and "myJobs" sub menus', function() {
      expect(self.subMenu.myOffers).not.toBeUndefined();
      expect(self.subMenu.myTaskers).not.toBeUndefined();
      expect(self.subMenu.myJobs).not.toBeUndefined();
    });
  });

  describe('self.parentState', function() {
    describe('when the current state includes "myJobs"', function() {
      it('returns "myJobs"', function() {
        spyOn(state, 'includes').and.callFake(function(stateName) {
          if (stateName === 'myJobs') return true;
          else return false;
        });
        var parent = self.parentState();
        expect(state.includes).toHaveBeenCalled();
        expect(parent).toEqual('myJobs');
      });
    });

    describe('when the current state includes "myTaskers"', function() {
      it('returns "myTaskers"', function() {
        spyOn(state, 'includes').and.callFake(function(stateName) {
          if (stateName === 'myTaskers') return true;
          else return false;
        });
        var parent = self.parentState();
        expect(state.includes).toHaveBeenCalled();
        expect(parent).toEqual('myTaskers');
      });
    });

    describe('when the current state includes "myOffers"', function() {
      it('returns "myOffers"', function() {
        spyOn(state, 'includes').and.callFake(function(stateName) {
          if (stateName === 'myOffers') return true;
          else return false;
        });
        var parent = self.parentState();
        expect(state.includes).toHaveBeenCalled();
        expect(parent).toEqual('myOffers');
      });
    });

    describe('when the current state doesn\'t include any state', function() {
      it('returns null', function() {
        spyOn(state, 'includes').and.returnValue(null);
        var parent = self.parentState();
        expect(state.includes).toHaveBeenCalled();
        expect(parent).toBeNull();
      });
    });
  });

  describe('self.isLoggedIn', function() {
    describe('when there is a token in cookies', function() {
      it('returns true', function() {
        spyOn(cookies, 'get').and.returnValue('this-is-my-user-token');
        expect(self.isLoggedIn()).toBeTruthy();
        expect(cookies.get).toHaveBeenCalled();
      });
    });

    describe('when there is no token in cookies', function() {
      it('returns false', function() {
        spyOn(cookies, 'get').and.returnValue(undefined);
        expect(self.isLoggedIn()).toBeFalsy();
        expect(cookies.get).toHaveBeenCalled();
      });
    });
  });

  describe('self.role', function() {
    describe('when the session storage user has a user with role', function() {
      it('returns that role', function() {
        var userMock = {
          roles: [ 'owner' ]
        };
        localStorage.user = userMock;
        expect(self.role()).toEqual('owner');
      });
    });

    describe('when the session storage doesn\'t have a user', function() {
      it('returns null', function() {
        expect(self.role()).toBeNull();
      });
    })
  });

  describe('self.login', function() {
    it('calls the $state.go function with "login" state', function() {
      spyOn(state, 'go');
      self.login();
      expect(state.go).toHaveBeenCalledWith('login', jasmine.any(Object));
    });

    it('turns all opened "search", "info" and "menu" flags to false', function() {
      self.searchOpen = self.menuOpen = true;
      self.infoOpen = false;
      self.login();
      expect(self.searchOpen).toEqual(false);
      expect(self.menuOpen).toEqual(false);
      expect(self.infoOpen).toEqual(false);
    });
  });

  describe('self.signUp', function() {
    it('calls the $state.go function with "role-choice" state', function() {
      spyOn(state, 'go');
      self.signUp();
      expect(state.go).toHaveBeenCalledWith('role-choice');
    });

    it('turns all opened "search", "info" and "menu" flags to false', function() {
      self.searchOpen = self.menuOpen = true;
      self.infoOpen = false;
      self.signUp();
      expect(self.searchOpen).toEqual(false);
      expect(self.menuOpen).toEqual(false);
      expect(self.infoOpen).toEqual(false);
    });
  });

  describe('self.logout', function() {
    it('calls the userService\'s logout method', inject(function(userService) {
      spyOn(userService, 'logout');
      self.logout();
      expect(userService.logout).toHaveBeenCalled();
    }));

    it('removes the token from cookies', function() {
      spyOn(cookies, 'remove');
      self.logout();
      expect(cookies.remove).toHaveBeenCalledWith('token');
    });

    it('calls the $reset function of localStorage', function() {
      spyOn(localStorage, '$reset');
      self.logout();
      expect(localStorage.$reset).toHaveBeenCalled();
    });

    it('turns all opened "search", "info" and "menu" flags to false', function() {
      self.searchOpen = self.menuOpen = true;
      self.infoOpen = false;
      self.logout();
      expect(self.searchOpen).toEqual(false);
      expect(self.menuOpen).toEqual(false);
      expect(self.infoOpen).toEqual(false);
    });

    it('calls the $state.go function with "landing" state', function() {
      spyOn(state, 'go');
      self.logout();
      expect(state.go).toHaveBeenCalledWith('landing', jasmine.any(Object));
    });
  });

  describe('self.myProfile', function() {
    it('turns all opened "search", "info" and "menu" flags to false', function() {
      self.searchOpen = self.menuOpen = true;
      self.infoOpen = false;
      self.myProfile();
      expect(self.searchOpen).toEqual(false);
      expect(self.menuOpen).toEqual(false);
      expect(self.infoOpen).toEqual(false);
    });

    describe('when the user in localStorage is an owner', function() {
      it('goes to the "myOffers.currentOffers" state', function() {
        localStorage.user = {
          roles: ['owner']
        };
        spyOn(state, 'go');
        self.myProfile();
        expect(state.go).toHaveBeenCalledWith('myOffers.currentOffers', jasmine.any(Object));
      });
    });

    describe('when the user in localStorage is an tasker', function() {
      it('goes to the "taskerProfile" state', function() {
        localStorage.user = {
          roles: ['tasker']
        };
        spyOn(state, 'go');
        self.myProfile();
        expect(state.go).toHaveBeenCalledWith('taskerProfile', jasmine.any(Object));
      });
    });

    describe('when there is no user in localStorage ', function() {
      it('goes to no where', function() {
        spyOn(state, 'go');
        self.myProfile();
        expect(state.go).not.toHaveBeenCalled();
      });
    });
  });

  describe('self.goTo', function() {
    it('calls the $state\'s go method with the given parameter', function() {
      spyOn(state, 'go');
      self.goTo('myPrettyState');
      expect(state.go).toHaveBeenCalledWith('myPrettyState', jasmine.any(Object));
    });

    it('turns all opened "search", "info" and "menu" flags to false', function() {
      self.searchOpen = self.menuOpen = true;
      self.infoOpen = false;
      self.goTo('anyState');
      expect(self.searchOpen).toEqual(false);
      expect(self.menuOpen).toEqual(false);
      expect(self.infoOpen).toEqual(false);
    });
  });

  describe('self.toggleInfo', function() {
    describe('when self.infoOpen is true', function() {
      it('turns it to false', function() {
        self.infoOpen = true;
        self.toggleInfo();
        expect(self.infoOpen).toBeFalsy();
      });
    });

    describe('when self.infoOpen is false', function() {
      it('turns it to true and turns "menuOpen" and "searchOpen" to false', function() {
        self.infoOpen = false;
        self.toggleInfo();
        expect(self.infoOpen).toBeTruthy();
        expect(self.menuOpen).toBeFalsy();
        expect(self.searchOpen).toBeFalsy();
      });
    });

    describe("when the given event is defined", function () {
      it("calls event.stopPropagation", function () {
        var eventMock = {
          stopPropagation: function() { }
        };
        spyOn(eventMock, "stopPropagation");
        self.toggleInfo(eventMock);
        expect(eventMock.stopPropagation).toHaveBeenCalled();
      });
    });
  });

  describe('self.toggleMenu', function() {
    describe('when self.menuOpen is true', function() {
      it('turns it to false', function() {
        self.menuOpen = true;
        self.toggleMenu();
        expect(self.menuOpen).toBeFalsy();
      });
    });

    describe('when self.infoOpen is false', function() {
      it('turns it to true and turns "infoOpen" and "searchOpen" to false', function() {
        self.menuOpen = false;
        self.toggleMenu();
        expect(self.menuOpen).toBeTruthy();
        expect(self.infoOpen).toBeFalsy();
        expect(self.searchOpen).toBeFalsy();
      });
    });

    describe("when the given event is defined", function () {
      it("calls event.stopPropagation", function () {
        var eventMock = {
          stopPropagation: function() { }
        };
        spyOn(eventMock, "stopPropagation");
        self.toggleMenu(eventMock);
        expect(eventMock.stopPropagation).toHaveBeenCalled();
      });
    });
  });

  describe("$window.onclick", function () {
    it("calls $scope.$apply method", function () {
      spyOn(scope, "$apply");
      windowMock.onclick();
      expect(scope.$apply).toHaveBeenCalled();
    });

    describe("when self.menuOpen is true", function () {
      it("sets self.menuOpen to false", function () {
        spyOn(scope, "$apply");
        self.menuOpen = true;
        windowMock.onclick();
        expect(self.menuOpen).toBeFalsy();
      });
    });

    describe("when self.infoOpen is true", function () {
      it("sets self.infoOpen to false", function () {
        spyOn(scope, "$apply");
        self.infoOpen = true;
        windowMock.onclick();
        expect(self.infoOpen).toBeFalsy();
      });
    });
  });

  describe('self.toggleSearch', function() {
    describe('when self.searchOpen is true', function() {
      it('turns it to false', function() {
        self.searchOpen = true;
        self.toggleSearch();
        expect(self.searchOpen).toBeFalsy();
      });

      describe("when the given elementId is defined", function () {
        it("sets self.infoOpen and self.menuOpen to false and calls focusFactory", function () {
          self.infoOpen = self.menuOpen = true;
          self.toggleSearch({ someElement: "yes" });
          expect(self.infoOpen).toBeFalsy();
          expect(self.menuOpen).toBeFalsy();
        });
      });
    });

    describe('when self.searchOpen is false', function() {
      it('turns it to true', function() {
        self.searchOpen = false;
        self.toggleSearch();
        expect(self.searchOpen).toBeTruthy();
      });
    });
  });

  describe("self.searchPlaceHolder", function () {
    describe("when the current user is a tasker", function () {
      it("returns 'Find a job...'", function () {
        spyOn(self, "role").and.returnValue("tasker");
        expect(self.searchPlaceHolder()).toEqual("Find a job...");
      });
    });

    describe("when the current user is an owner", function () {
      it("returns 'Find a tasker...'", function () {
        spyOn(self, "role").and.returnValue("owner");
        expect(self.searchPlaceHolder()).toEqual("Find a tasker...");
      });
    });

    describe("when there is no user logged in", function () {
      it("returns 'Find a tasker...'", function () {
        spyOn(self, "role").and.returnValue(null);
        expect(self.searchPlaceHolder()).toEqual("Find a tasker...");
      });
    });
  });

  describe("self.search", function () {
    it("resets the value of self.searchText to empty string", function () {
      self.searchText = 'some-text-that-will-dissapear';
      spyOn(self, "role");
      spyOn(state, "go");
      self.search();
      expect(self.searchText).toEqual('');
    });

    describe("when the current user is a tasker", function () {
      it("goes to 'myJobs.availableJobs' state with the current self.searchText", function () {
        self.searchText = 'my-pretty-filter';
        spyOn(self, "role").and.returnValue('tasker');
        spyOn(state, "go");
        self.search();
        expect(state.go).toHaveBeenCalledWith('myJobs.availableJobs', jasmine.objectContaining({
          filter: 'my-pretty-filter'
        }));
      });
    });

    describe("when the current user is an owner", function () {
      it("goes to 'myTaskers.findTasker' state with the current self.searchText", function () {
        self.searchText = 'my-pretty-filter-2';
        spyOn(self, "role").and.returnValue('owner');
        spyOn(state, "go");
        self.search();
        expect(state.go).toHaveBeenCalledWith('myTaskers.findTasker', jasmine.objectContaining({
          filter: 'my-pretty-filter-2'
        }));
      });
    });
  });

  describe('self.user', function() {
    describe("when localStorage has a user", function () {
      it("returns the required user field", function () {
        localStorage.user = {
          roles: [ "owner" ],
          name: "Santiago",
          lastName: "Vanegas"
        };
        expect(self.user('roles')).toEqual(["owner"]);
        expect(self.user('name')).toEqual("Santiago");
        expect(self.user('lastName')).toEqual("Vanegas");
      });
    });

    describe("when localStorage doesn't have a user", function () {
      it("returns null", function () {
        expect(self.user('hey')).toBeNull();
      });
    });
  });
});
