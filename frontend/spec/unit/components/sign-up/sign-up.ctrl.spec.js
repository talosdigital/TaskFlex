describe("SignUpCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, localStorage, cookies, state, stateParams, userServiceMock, authServiceMock,
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
      },
      buildCustom: function() {
        return {
          error: false
        };
      }
    };
    self = $controller('SignUpCtrl', {
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


  describe("self.passwordInputType", function () {
    it("is 'password' by default", function () {
      expect(self.passwordInputType).toEqual('password');
    });
  });

  describe("self.role", function () {
    describe("when $stateParams has 'owner' as role", function () {
      it("is 'owner'", inject(function ($controller) {
        stateParams.role = "owner";
        self = $controller('SignUpCtrl', {
          $stateParams: stateParams
        });
        expect(self.role).toEqual("owner");
      }));
    });

    describe("when $stateParams has 'tasker' as role", function () {
      it("is 'tasker'", inject(function ($controller) {
        stateParams.role = "tasker";
        self = $controller('SignUpCtrl', {
          $stateParams: stateParams
        });
        expect(self.role).toEqual("tasker");
      }));
    });

    describe("when $stateParams has no specified role", function () {
      it("is 'owner'", inject(function ($controller) {
        expect(self.role).toEqual("tasker");
      }));
    });
  });

  describe("self.user", function () {
    it("is not undefined initially", function () {
      expect(self.user).not.toBeUndefined();
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
  //
  describe('self.submit', function() {
    describe('when the form is not valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(false);
        expect(self.submitted).toBeTruthy();
      });

      it('doesn\'t call neither taskerService nor ownerService create methods',
          inject(function(taskerService, ownerService) {
            spyOn(taskerService, 'createTasker');
            spyOn(ownerService, 'createOwner');
            self.submit(false);
            expect(taskerService.createTasker).not.toHaveBeenCalled();
            expect(ownerService.createOwner).not.toHaveBeenCalled();
      }));
    });

    describe('when the form is valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(true);
        expect(self.submitted).toBeTruthy();
      });

      describe("when self.role is 'owner'", function () {
        it("calls ownerService's createOwner method", inject(function ($q, ownerService) {
          self.role = "owner";
          var response = $q.defer();
          spyOn(ownerService, 'createOwner').and.returnValue(response.promise);
          self.submit(true);
          expect(ownerService.createOwner).toHaveBeenCalled();
        }));
      });

      describe("when self.role is 'tasker'", function () {
        it("calls taskerService's createTasker method", inject(function ($q, taskerService) {
          self.role = "tasker";
          var response = $q.defer();
          spyOn(taskerService, 'createTasker').and.returnValue(response.promise);
          self.submit(true);
          expect(taskerService.createTasker).toHaveBeenCalled();
        }));
      });

      describe('when the owner promise succeeds', function() {
        it('calls the self.goToLogin method', inject(function($q, ownerService) {
          self.role = "owner";
          var response = $q.defer();
          spyOn(ownerService, 'createOwner').and.returnValue(response.promise);
          spyOn(self, 'goToLogin');
          self.submit(true);
          response.resolve({ token: 'my-received-token' });
          scope.$digest();
          expect(self.goToLogin).toHaveBeenCalled();
        }));
      });

      describe('when owner promise method fails', function() {
        it('builds a failure alert', inject(function($q, ownerService) {
          self.role = "owner";
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerService, 'createOwner').and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.submit(true);
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.togglePasswordVisibility", function () {
    describe("when self.passwordInputType is 'password'", function () {
      it("sets it to 'text'", function () {
        self.passwordInputType = "password";
        self.togglePasswordVisibility();
        expect(self.passwordInputType).toEqual("text");
      });
    });

    describe("when self.passwordInputType is 'text'", function () {
      it("sets it to 'password'", function () {
        self.passwordInputType = "text";
        self.togglePasswordVisibility();
        expect(self.passwordInputType).toEqual("password");
      });
    });
  });

  describe("self.goToLogin", function () {
    describe("when the alertMessage parameter is undefined", function () {
      it("calls the $state.go method without an alert parameter", function () {
        spyOn(state, "go");
        self.goToLogin();
        expect(state.go).not.toHaveBeenCalledWith('login', jasmine.objectContaining({
          alert: jasmine.anything()
        }));
      });
    });

    describe("when the alertMessage parameter is empty", function () {
      it("calls the $state.go method without an alert parameter", function () {
        spyOn(state, "go");
        self.goToLogin('');
        expect(state.go).not.toHaveBeenCalledWith('login', jasmine.objectContaining({
          alert: jasmine.anything()
        }));
      });
    });

    describe("when the alertMessage parameter is not empty", function () {
      it("builds an alert and calls the $state.go method", function () {
        spyOn(state, "go");
        spyOn(alertServiceMock, "buildCustom");
        self.goToLogin('hi-this-is-my-alert-message');
        expect(alertServiceMock.buildCustom).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith('login', jasmine.anything());
      });
    });
  });

  describe("self.facebook", function () {
    describe("when facebookService.login succeeds", function () {
      it("stores the token in the cookies", inject(function ($q, facebookService) {
        spyOn(cookies, "put");
        spyOn(self, "storeUserInformation");
        var response = $q.defer();
        spyOn(facebookService, 'login').and.returnValue(response.promise);
        self.facebook();
        response.resolve({ token: 'my-facebook-token' });
        scope.$digest();
        expect(cookies.put).toHaveBeenCalledWith('token', 'my-facebook-token');
      }));
    });

    describe("when facebookService.login fails", function() {
      it("builds an alert with an error message", inject(function ($q, facebookService) {
        var response = $q.defer();
        spyOn(facebookService, 'login').and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        self.facebook();
        response.reject({ status: 400, data: {} });
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      }));
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
      it('shows a failure alert', inject(function($q) {
        expect(self.alert).toBeUndefined();
        var response = $q.defer();
        spyOn(userServiceMock, 'currentUser').and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        spyOn(self, 'logout');
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
