describe("LoginCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, localStorage, cookies, state, stateParams, authServiceMock, userServiceMock,
      alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    localStorage = {
      $reset: function() { }
    };
    cookies = {
      get: function() { },
      remove: function() { },
      put: function() { }
    };
    state = {
      go: function() { },
      includes: function() { }
    };
    stateParams = {};
    userServiceMock = {
      login: function() { return $q.defer().promise },
      logout: function() { return $q.defer().promise },
      currentUser: function() { return $q.defer().promise }
    };
    authServiceMock = {
      authorize: function() { return true }
    };
    alertServiceMock = {
      buildSuccess: function() { 
        return {
          error: false
        };
      },
      buildError: function() {
        return {
          error: false
        };
      }
    };
    self = $controller('LoginCtrl', {
      $scope: scope,
      $localStorage: localStorage,
      $cookies: cookies,
      $state: state,
      $stateParams: stateParams,
      userService: userServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.user", function () {
    it("has some default values", function () {
      expect(self.user.remember).toBeFalsy();
    });
  });

  describe("self.submitted", function () {
    it("is false by default", function () {
      expect(self.submitted).toBeFalsy();
    });
  });

  describe("self.logout", function () {
    it("calls userService's logout method", function() {
      spyOn(userServiceMock, "logout");
      self.logout();
      expect(userServiceMock.logout).toHaveBeenCalled();
    });

    it("removes the token from cookies", function () {
      spyOn(cookies, "remove");
      self.logout();
      expect(cookies.remove).toHaveBeenCalledWith('token');
    });

    it("calls localStorage's $reset method", function () {
      spyOn(localStorage, "$reset");
      self.logout();
      expect(localStorage.$reset).toHaveBeenCalled();
    });
  });

  describe('self.submit', function() {
    describe('when the form is not valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(false);
        expect(self.submitted).toBeTruthy();
      });

      it('doesn\'t call the userService\'s login method', function() {
        spyOn(userServiceMock, 'login');
        self.submit(false);
        expect(userServiceMock.login).not.toHaveBeenCalled();
      });
    });

    describe('when the form is valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(true);
        expect(self.submitted).toBeTruthy();
      });

      it('calls userService\'s login method', inject(function($q) {
        var response = $q.defer();
        spyOn(userServiceMock, 'login').and.returnValue(response.promise);
        self.submit(true);
        expect(userServiceMock.login).toHaveBeenCalled();
      }));

      describe('when userService.login method succeeds', function() {
        it('puts the token received in cookies', inject(function($q) {
          var response = $q.defer();
          spyOn(userServiceMock, 'login').and.returnValue(response.promise);
          spyOn(cookies, 'put');
          spyOn(self, 'storeUserInformation');
          self.submit(true);
          response.resolve({ token: 'my-received-token' });
          scope.$digest();
          expect(cookies.put).toHaveBeenCalledWith('token', 'my-received-token');
        }));

        it('calls the self.storeUserInformation method', inject(function($q) {
          var response = $q.defer();
          spyOn(userServiceMock, 'login').and.returnValue(response.promise);
          spyOn(self, 'storeUserInformation');
          self.submit(true);
          response.resolve({ token: 'my-received-token' });
          scope.$digest();
          expect(self.storeUserInformation).toHaveBeenCalled();
        }));
      });

      describe('when userService.login method fails', function() {
        it('builds a failure alert', inject(function($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(userServiceMock, 'login').and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.submit(true);
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe('self.storeUserInformation', function() {
    describe('when the userService.currentUser method succeeds', function() {
      it('sets the response to the localStorage user', inject(function($q) {
        expect(localStorage.user).toBeUndefined();
        var response = $q.defer();
        spyOn(userServiceMock, 'currentUser').and.returnValue(response.promise);
        spyOn(self, "redirectRole");
        self.storeUserInformation();
        var userMock = {
          name: "Santiago",
          lastName: "Vanegas",
          roles: ["owner"]
        };
        response.resolve(userMock);
        scope.$digest();
        expect(localStorage.user).toEqual(userMock);
      }));

      describe("when $stateParams.comeBack is defined", function () {
        it("calls self.handleComeBack", inject(function ($q) {
          var response = $q.defer();
          spyOn(userServiceMock, 'currentUser').and.returnValue(response.promise);
          spyOn(self, "handleComeBack");
          stateParams.comeBack = { state: "some-state" };
          self.storeUserInformation();
          response.resolve();
          scope.$digest();
          expect(self.handleComeBack).toHaveBeenCalled();
        }));
      });

      describe("when $stateParams.comeBack is not defined", function () {
        it("calls self.redirectRole", inject(function ($q) {
          var response = $q.defer();
          spyOn(userServiceMock, 'currentUser').and.returnValue(response.promise);
          spyOn(self, "redirectRole");
          stateParams.comeBack = undefined;
          self.storeUserInformation();
          response.resolve();
          scope.$digest();
          expect(self.redirectRole).toHaveBeenCalled();
        }));
      });
    });

    describe('when the userService.currentUser method fails', function() {
      it('builds a failure alert', inject(function($q) {
        expect(self.alert).toBeUndefined();
        var response = $q.defer();
        spyOn(userServiceMock, 'currentUser').and.returnValue(response.promise);
        spyOn(self, 'logout');
        spyOn(alertServiceMock, "buildError");
        self.storeUserInformation();
        response.reject({ status: 400, data: {} });
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      }));
    });
  });

  describe("self.handleComeBack", function () {
    describe("when $stateParams.comeBack.state is landing", function () {
      it("calls self.redirectRole", function () {
        stateParams.comeBack = {
          state: 'landing'
        };
        spyOn(self, "redirectRole");
        self.handleComeBack();
        expect(self.redirectRole).toHaveBeenCalled();
        stateParams.comeBack = {
          state: {
            name: 'landing'
          }
        };
        self.handleComeBack();
        expect(self.redirectRole).toHaveBeenCalled();
      });
    });

    describe("when the given state in $stateParams.comeBack is not landing", function () {
      it("goes to the given state in comeBack params", function () {
        stateParams.comeBack = {
          state: 'login',
          params: {
            hello: 'my-param',
            seeYa: 'bye-param'
          }
        };
        spyOn(state, "go");
        self.handleComeBack();
        expect(state.go).toHaveBeenCalledWith('login', jasmine.objectContaining(
          stateParams.comeBack.params
        ));
      });
    });
  });

  describe("self.redirectRole", function () {
    describe("when stateParams.comeBack is not defined", function () {
      it("sets it to an empty object", function () {
        stateParams.comeBack = undefined;
        localStorage.user = {
          roles: [ "owner" ]
        };
        spyOn(state, "go");
        self.redirectRole();
        expect(stateParams.comeBack).toEqual({});
      });
    });

    describe("when the current user role is owner", function () {
      it("goes to myTaskers.findTasker state", function () {
        localStorage.user = {
          roles: [ "owner" ]
        };
        stateParams.comeBack = {
          params: {
            myParam: 'hello',
            secondParam: 'bye'
          }
        }
        spyOn(state, "go");
        self.redirectRole();
        expect(state.go).toHaveBeenCalledWith('myTaskers.findTasker', jasmine.objectContaining({
            myParam: 'hello',
            secondParam: 'bye'
        }));
      });
    });

    describe("when the current user role is tasker", function () {
      it("goes to myJobs.availableJobs state", function () {
        localStorage.user = {
          roles: [ "tasker" ]
        };
        stateParams.comeBack = {
          params: {
            myParam: 'hello',
            secondParam: 'bye'
          }
        }
        spyOn(state, "go");
        self.redirectRole();
        expect(state.go).toHaveBeenCalledWith('myJobs.availableJobs', jasmine.objectContaining({
            myParam: 'hello',
            secondParam: 'bye'
        }));
      });
    });
  });
});
