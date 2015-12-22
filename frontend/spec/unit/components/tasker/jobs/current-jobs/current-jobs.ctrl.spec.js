describe("CurrentJobsCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, taskerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: {}
    };
    stateParams = {
      page: 2
    },
    taskerServiceMock = {
      getCurrentJobs: function() { return $q.defer().promise }
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
    self = $controller('CurrentJobsCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      taskerService: taskerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.pages", function () {
    it("is 0 initially", function () {
      expect(self.pages).toEqual(0);
    });
  });

  describe("self.currentPage", function () {
    it("has the $stateParams.page value", function () {
      expect(self.currentPage).toEqual(stateParams.page);
    });
  });

  describe("self.jobs", function () {
    it("has an empty array as default value", function () {
      expect(self.jobs).toEqual([]);
    });
  });

  describe("self.retrieveJobs", function () {
    describe("when taskerService.getCurrentJobs succeeds", function () {
      it("stores the response jobs in self.jobs", inject(function ($q) {
        var jobsMock = [
          {
            name: "Job 1",
            description: "My description 1"
          },
          {
            name: "Job 2",
            description: "My description 2"
          }
        ];
        expect(self.jobs).toEqual([]);
        var response = $q.defer();
        spyOn(taskerServiceMock, "getCurrentJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: jobsMock });
        scope.$digest();
        expect(self.jobs).toEqual(jobsMock);
      }));

      it("stores the response totalPages self.pages", inject(function ($q) {
        var response = $q.defer();
        spyOn(taskerServiceMock, "getCurrentJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: [], totalPages: 5 });
        scope.$digest();
        expect(self.pages).toEqual(5);
      }));

      it("stores the response currentPage self.currentPage", inject(function ($q) {
        var response = $q.defer();
        spyOn(taskerServiceMock, "getCurrentJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: [], currentPage: 5 });
        scope.$digest();
        expect(self.currentPage).toEqual(5);
      }));
    });

    describe("when taskerService.getCurrentJobs fails", function () {
      describe("when response status is 400", function () {
        it("shows an alert with some error message", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getCurrentJobs").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveJobs();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when response status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getCurrentJobs").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveJobs();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalled();
        }));
      });

      describe("when response status is neither 400 nor 401", function () {
        it("shows an alert with some error message", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getCurrentJobs").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveJobs();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.onPageChange", function () {
    it("calls state.go with the current state and the given page", function () {
      spyOn(state, "go");
      self.onPageChange(6);
      expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
        page: 6
      }));
    });
  });
});
