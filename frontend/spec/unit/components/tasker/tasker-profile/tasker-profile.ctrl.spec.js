describe("TaskerProfileCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, localStorage, cookies, state, stateParams, taskerServiceMock, authServiceMock,
      alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    localStorage = { };
    cookies = {
      get: function() { }
    };
    state = {
      go: function() { }
    };
    stateParams = {
      id: 'my-tasker-id'
    };
    taskerServiceMock = {
      getTaskerInfo: function() { return $q.defer().promise; }
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
    self = $controller('TaskerProfileCtrl', {
      $scope: scope,
      $localStorage: localStorage,
      $cookies: cookies,
      $state: state,
      $stateParams: stateParams,
      taskerService: taskerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.taskerId", function () {
    it("has the same value as $stateParams.id by default", function () {
      expect(self.taskerId).toEqual(stateParams.id);
    });
  });

  describe("self.taskerFound", function () {
    it("has true as default value", function () {
      expect(self.taskerFound).toBeTruthy();
    });
  });

  describe("self.tasker", function () {
    it("is an empty object as default value", function () {
      expect(self.tasker).toBeDefined();
      expect(self.tasker).toEqual({});
    });
  });

  describe("self.retrieveTasker", function () {
    describe("when taskerService.getTaskerInfo succeeds", function () {
      it("assings the response to self.tasker", inject(function ($q) {
        var taskerMock = {
          firstName: "Santiago",
          lastName: "Vanegas"
        };
        var response = $q.defer();
        spyOn(taskerServiceMock, "getTaskerInfo").and.returnValue(response.promise);
        self.retrieveTasker('some-id');
        response.resolve(taskerMock);
        scope.$digest();
        expect(self.tasker).toEqual(taskerMock);
      }));

      describe("when self.tasker.metadata.previousJobs is defined", function () {
        describe("when previousJobs length is 0", function () {
          it("sets self.showEmpty to true", inject(function ($q) {
            var taskerMock = {
              metadata: {
                previousJobs: []
              }
            };
            self.showEmpty = false;
            var response = $q.defer();
            spyOn(taskerServiceMock, "getTaskerInfo").and.returnValue(response.promise);
            self.retrieveTasker('some-id');
            response.resolve(taskerMock);
            scope.$digest();
            expect(self.showEmpty).toBeTruthy();
          }));
        });

        describe("when previousJobs length is not 0", function () {
          it("sets self.showEmpty to false", inject(function ($q) {
            var taskerMock = {
              metadata: {
                previousJobs: [{}]
              }
            };
            self.showEmpty = true;
            var response = $q.defer();
            spyOn(taskerServiceMock, "getTaskerInfo").and.returnValue(response.promise);
            self.retrieveTasker('some-id');
            response.resolve(taskerMock);
            scope.$digest();
            expect(self.showEmpty).toBeFalsy();
          }));
        });
      });
    });

    describe("when taskerService.getTaskerInfo fails", function () {
      it("builds an error alert and sets self.taskerFound to false", inject(function ($q) {
        self.taskerFound = true;
        var response = $q.defer();
        spyOn(taskerServiceMock, "getTaskerInfo").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        self.retrieveTasker('some-id');
        response.reject({ status: 404, data: {} });
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
        expect(self.taskerFound).toBeFalsy();
      }));
    });
  });

  describe("self.isMyProfile", function () {
    describe("when localStorage user has the same id as self.taskerId", function () {
      it("returns true", function () {
        localStorage.user = {
          id: 'my-tasker-id'
        };
        self.taskerId = 'my-tasker-id';
        expect(self.isMyProfile()).toBeTruthy();
      });
    });

    describe("when the localStorage user has a different id of self.taskerId", function () {
      it("returns false", function () {
        localStorage.user = {
          id: 'my-tasker-id'
        };
        self.taskerId = 'my-different-tasker-id';
        expect(self.isMyProfile()).toBeFalsy();
      });
    });

    describe("when the localStorage doesn't have a user", function () {
      it("returns false", function () {
        self.taskerId = 'my-tasker-id';
        expect(self.isMyProfile()).toBeFalsy();
      });
    });
  });

  describe("self.invite", function () {
    describe("when there is a token in cookies", function () {
      it("goes to the 'invite' state with the tasker id", function () {
        self.tasker.id = 'the-tasker-id';
        spyOn(cookies, "get").and.returnValue('my-token');
        spyOn(state, "go");
        self.invite();
        expect(state.go).toHaveBeenCalledWith('invite', jasmine.objectContaining({
          tasker: 'the-tasker-id'
        }));
      });
    });

    describe("when there is no token in cookies", function () {
      it("redirects to sign-up page with proper parameters", function () {
        self.tasker.firstName = "Santiago";
        self.tasker.lastName = "Vanegas";
        self.tasker.id = "my-tasker-id";
        spyOn(cookies, "get").and.returnValue(undefined);
        spyOn(state, "go");
        self.invite();
        expect(state.go).toHaveBeenCalledWith('sign-up', jasmine.objectContaining({
          hiring: jasmine.objectContaining({
            firstName: "Santiago",
            lastName: "Vanegas"
          }),
          comeBack: jasmine.objectContaining({
            state: 'invite',
            params: jasmine.objectContaining({
              tasker: 'my-tasker-id'
            })
          }),
          role: 'owner'
        }));
      });
    });
  });
});
