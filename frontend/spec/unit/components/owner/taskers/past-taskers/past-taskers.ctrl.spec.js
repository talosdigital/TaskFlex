describe('PastTaskersCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, ownerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    stateParams = {
      page: '5'
    };
    state = {
      go: function() { },
      current: 'pastTaskers'
    };
    ownerServiceMock = {
      getPastTaskers: function() { return $q.defer().promise },
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
    self = $controller('PastTaskersCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      ownerService: ownerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.pages", function () {
    it("is set to 0 by default", function () {
      expect(self.pages).toEqual(0);
    });
  });

  describe("self.currentPage", function () {
    it("has the value of $stateParams.page by default", function () {
      expect(self.currentPage).toEqual('5');
    });
  });

  describe("self.items", function () {
    it("is an empty array by default", function () {
      expect(self.items).toEqual([]);
    });
  });

  describe("self.retrievePastTaskers", function () {
    it("calls ownerService.getPastTaskers whit the proper parameters", inject(function ($q) {
      spyOn(ownerServiceMock, "getPastTaskers").and.returnValue($q.defer().promise);
      self.currentPage = '1';
      self.retrievePastTaskers();
      expect(ownerServiceMock.getPastTaskers).toHaveBeenCalledWith(jasmine.objectContaining({
        page: '1',
      }));
    }));

    describe("when ownerService.getPastTaskers succeeds", function () {
      it("sets the response data.offers to self.items", inject(function ($q) {
        var itemsMock = [
          {
            tasker: { name: "Santiago", profession: "Developer" },
            job: { name: "My new job", description: "This is a job description" },
            offerStatus: "ACCEPTED"
          },
          {
            tasker: { name: "Juan", profession: "Smith" },
            job: { name: "Another of my jobs", description: "Shorter desc" },
            offerStatus: "ACCEPTED"
          }
        ];
        var response = $q.defer();
        spyOn(ownerServiceMock, "getPastTaskers").and.returnValue(response.promise);
        self.retrievePastTaskers();
        response.resolve({ offers: itemsMock });
        scope.$digest();
        expect(self.items).toEqual(itemsMock);
      }));

      it("sets the response data.totalPages to self.pages", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getPastTaskers").and.returnValue(response.promise);
        self.retrievePastTaskers();
        response.resolve({ offers: [], totalPages: 10 });
        scope.$digest();
        expect(self.pages).toEqual(10);
      }));

      it("sets the response data.currentPage to self.currentPage", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getPastTaskers").and.returnValue(response.promise);
        self.retrievePastTaskers();
        response.resolve({ offers: [], currentPage: 5 });
        scope.$digest();
        expect(self.currentPage).toEqual(5);
      }));
    });

    describe("when ownerService.getPastTaskers fails", function () {
      describe("when response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastTaskers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrievePastTaskers();
          response.reject({ status: 400, data: {}});
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastTaskers").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrievePastTaskers();
          response.reject({ status: 401, data: {}});
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when response.status is not 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPastTaskers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrievePastTaskers();
          response.reject({ status: 500, data: {}});
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.viewProfile", function () {
    it("calls $state.go with the given taskerId as a part of parameter", function () {
      spyOn(state, "go");
      self.viewProfile("my-tasker-id");
      expect(state.go).toHaveBeenCalledWith('taskerProfile', jasmine.objectContaining({
        id: 'my-tasker-id'
      }));
    });
  });

  describe("self.onPageChange", function () {
    it("calls $state.go with the given page as part of the parameters", function () {
      spyOn(state, "go");
      self.onPageChange(2);
      expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
        page: 2
      }));
      self.onPageChange('10');
      expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
        page: '10'
      }));
    });
  });
});
