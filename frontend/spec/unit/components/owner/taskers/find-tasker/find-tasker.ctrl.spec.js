describe('FindTaskerCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, taskerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    stateParams = {
      filter: ''
    };
    state = {
      go: function() { },
      current: 'myTaskers.findTasker'
    };
    taskerServiceMock = {
      getAvailableTaskers: function() { return $q.defer().promise },
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
    self = $controller('FindTaskerCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      taskerService: taskerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.showEmpty", function () {
    it("is false by default", function () {
      expect(self.showEmpty).toBeFalsy();
    });
  });

  describe("self.taskers", function () {
    it("is an empty array by default", function () {
      expect(self.taskers).toEqual([]);
    });
  });

  describe("description", function () {
    it("has the $stateParams.filter value by default", function () {
      expect(self.filter).toEqual(stateParams.filter);
    });
  });

  describe("self.applyFilter", function () {
    describe("when taskerService.getAvailableTaskers succeeds", function () {
      it("sets the response to self.taskers", inject(function ($q) {
        var response = $q.defer();
        var taskersMock = [
          {
            name: "tasker-1"
          },
          {
            name: "tasker-2"
          }
        ];
        spyOn(taskerServiceMock, "getAvailableTaskers").and.returnValue(response.promise);
        self.applyFilter('');
        response.resolve(taskersMock);
        scope.$digest();
        expect(self.taskers).toEqual(taskersMock);
      }));
    });

    describe("when taskerService.getAvailableTaskers fails", function () {
      describe("when the response status is 400", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getAvailableTaskers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.applyFilter('');
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response status is not 400", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getAvailableTaskers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.applyFilter('');
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });
});
