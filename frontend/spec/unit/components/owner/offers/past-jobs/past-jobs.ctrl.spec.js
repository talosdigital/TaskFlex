describe("PastOffersCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, ownerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: 'myOffers.pastOffers'
    };
    stateParams = {
      page: 2
    },
    ownerServiceMock = {
      getPastJobs: function() { return $q.defer().promise }
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
    self = $controller('PastOffersCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      ownerService: ownerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.pages", function () {
    it("is 0 by default", function () {
      expect(self.pages).toEqual(0);
    });
  });

  describe("self.currentPage", function () {
    it("has the $stateParams.page value by default", function () {
      expect(self.currentPage).toEqual(stateParams.page);
    });
  });

  describe("self.jobs", function () {
    it("is an empty array by default", function () {
      expect(self.jobs).toEqual([]);
    });
  });

  describe("self.showEmpty", function () {
    it("is false by default", function () {
      expect(self.showEmpty).toBeFalsy();
    });
  });

  describe("self.retrieveJobs", function () {
    describe("when ownerService.getPastJobs succeeds", function () {
      it("sets the response jobs to self.jobs", inject(function ($q) {
        var response = $q.defer();
        var jobsMock = [
          {
            name: "my-job",
            description: "my-description"
          },
          {
            name: "my-other-job",
            description: "my-another-description"
          }
        ];
        spyOn(ownerServiceMock, "getPastJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: jobsMock });
        scope.$digest();
        expect(self.jobs).toEqual(jobsMock);
      }));

      it("stores the response currentPage and totalPages in self variables", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getPastJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: [], totalPages: 4, currentPage: 3 });
        scope.$digest();
        expect(self.pages).toEqual(4);
        expect(self.currentPage).toEqual(3);
      }));

      describe("when the response jobs length is 0", function () {
        it("sets self.showEmpty to true", inject(function ($q) {
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastJobs").and.returnValue(response.promise);
          self.retrieveJobs();
          response.resolve({ jobs: [] });
          scope.$digest();
          expect(self.showEmpty).toBeTruthy();
        }));
      });

      describe("when the response jobs length greater than 0", function () {
        it("sets self.showEmpty to false", inject(function ($q) {
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastJobs").and.returnValue(response.promise);
          self.retrieveJobs();
          response.resolve({ jobs: [ {}, {}, {} ] });
          scope.$digest();
          expect(self.showEmpty).toBeFalsy();
        }));
      });
    });

    describe("when ownerService.getPastJobs fails", function () {
      describe("when the response status is 400", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastJobs").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveJobs();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastJobs").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveJobs();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response status is 400", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastJobs").and.returnValue(response.promise);
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
    it("reloads the current page with the given page", function () {
      spyOn(state, "go");
      self.onPageChange(10);
      expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
        page: 10
      }));
    });
  });
});
