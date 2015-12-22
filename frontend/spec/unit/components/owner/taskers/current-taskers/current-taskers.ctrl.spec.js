describe('CurrentTaskersCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, ownerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    stateParams = {
      page: '5',
      status: 'ACCEPTED',
      job: '30'
    };
    state = {
      go: function() { },
      current: 'currentTaskers'
    };
    ownerServiceMock = {
      getCurrentTaskers: function() { return $q.defer().promise },
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
    self = $controller('CurrentTaskersCtrl', {
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

  describe("self.status", function () {
    it("has the value of $stateParams.status by default", function () {
      expect(self.status).toEqual('ACCEPTED');
    });
  });

  describe("self.jobId", function () {
    it("has the value of $stateParams.job by default", function () {
      expect(self.jobId).toEqual('30');
    });
  });

  describe("self.items", function () {
    it("is an empty array by default", function () {
      expect(self.items).toEqual([]);
    });
  });

  describe("self.retrieveCurrentTaskers", function () {
    it("calls ownerService.getCurrentTaskers whit the proper parameters", inject(function ($q) {
      spyOn(ownerServiceMock, "getCurrentTaskers").and.returnValue($q.defer().promise);
      self.currentPage = '1';
      self.status = 'accepted';
      self.retrieveCurrentTaskers();
      expect(ownerServiceMock.getCurrentTaskers).toHaveBeenCalledWith(jasmine.objectContaining({
        page: '1',
        status: 'ACCEPTED'
      }));
      self.currentPage = '10';
      self.status = 'ReJecTed';
      self.retrieveCurrentTaskers();
      expect(ownerServiceMock.getCurrentTaskers).toHaveBeenCalledWith(jasmine.objectContaining({
        page: '10',
        status: 'REJECTED'
      }));
      self.currentPage = '2';
      self.status = '';
      self.retrieveCurrentTaskers();
      expect(ownerServiceMock.getCurrentTaskers).toHaveBeenCalledWith(jasmine.objectContaining({
        page: '2',
        status: ''
      }));
    }));

    describe("when ownerService.getCurrentTaskers succeeds", function () {
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
            offerStatus: "REJECTED"
          }
        ];
        var response = $q.defer();
        spyOn(ownerServiceMock, "getCurrentTaskers").and.returnValue(response.promise);
        self.retrieveCurrentTaskers();
        response.resolve({ offers: itemsMock });
        scope.$digest();
        expect(self.items).toEqual(itemsMock);
      }));

      it("sets the response data.totalPages to self.pages", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getCurrentTaskers").and.returnValue(response.promise);
        self.retrieveCurrentTaskers();
        response.resolve({ offers: [], totalPages: 10 });
        scope.$digest();
        expect(self.pages).toEqual(10);
      }));

      it("sets the response data.currentPage to self.currentPage", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getCurrentTaskers").and.returnValue(response.promise);
        self.retrieveCurrentTaskers();
        response.resolve({ offers: [], currentPage: 5 });
        scope.$digest();
        expect(self.currentPage).toEqual(5);
      }));
    });

    describe("when ownerService.getCurrentTaskers fails", function () {
      describe("when response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerServiceMock, "getCurrentTaskers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveCurrentTaskers();
          response.reject({ status: 400, data: {}});
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(ownerServiceMock, "getCurrentTaskers").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveCurrentTaskers();
          response.reject({ status: 401, data: {}});
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when response.status is not 400 nor 401", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerServiceMock, "getCurrentTaskers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveCurrentTaskers();
          response.reject({ status: 500, data: {}});
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.isActiveStatus", function () {
    describe("when self.status is equivalent to the given status", function () {
      it("returns true", function () {
        self.status = '';
        expect(self.isActiveStatus('')).toBeTruthy();
        self.status = 'ACCEPTED';
        expect(self.isActiveStatus('ACCEPTED')).toBeTruthy();
        expect(self.isActiveStatus('Accepted')).toBeTruthy();
        expect(self.isActiveStatus('accepted')).toBeTruthy();
        self.status = 'REJECTED';
        expect(self.isActiveStatus('REJECTED')).toBeTruthy();
        expect(self.isActiveStatus('Rejected')).toBeTruthy();
        expect(self.isActiveStatus('rejected')).toBeTruthy();
        self.status = 'PENDING';
        expect(self.isActiveStatus('PENDING')).toBeTruthy();
        expect(self.isActiveStatus('Pending')).toBeTruthy();
        expect(self.isActiveStatus('pending')).toBeTruthy();
      });
    });

    describe("when self.status is not equivalent to the given status", function () {
      it("returns false", function () {
        self.status = 'ACCEPTED';
        expect(self.isActiveStatus('Rejected')).toBeFalsy();
        expect(self.isActiveStatus('Pending')).toBeFalsy();
        expect(self.isActiveStatus('')).toBeFalsy();
        self.status = 'REJECTED';
        expect(self.isActiveStatus('Accepted')).toBeFalsy();
        expect(self.isActiveStatus('Pending')).toBeFalsy();
        expect(self.isActiveStatus('')).toBeFalsy();
        self.status = 'PENDING';
        expect(self.isActiveStatus('Accepted')).toBeFalsy();
        expect(self.isActiveStatus('Rejected')).toBeFalsy();
        expect(self.isActiveStatus('')).toBeFalsy();
      });
    });
  });

  describe("self.changeStatus", function () {
    describe("when the given status is the same as self.status", function () {
      it("sets self.status to empty string and calls self.loadChange", function () {
        self.status = 'ACCEPTED';
        spyOn(self, "loadChange");
        self.changeStatus('ACCEPTED');
        expect(self.status).toEqual('');
        expect(self.loadChange).toHaveBeenCalled();
      });
    });

    describe("when the given status is not the same as self.status", function () {
      it("sets the given status to self.status and calls self.loadChange", function () {
        self.status = 'ACCEPTED';
        spyOn(self, "loadChange");
        self.changeStatus('REJECTED');
        expect(self.status).toEqual('REJECTED');
        expect(self.loadChange).toHaveBeenCalled();
      });
    });
  });

  describe("self.loadChange", function () {
    it("build parameters and calls $state.go", function () {
      self.status = "ACCEPTED";
      spyOn(state, "go");
      self.loadChange(2, 10);
      expect(state.go).toHaveBeenCalledWith('currentTaskers', jasmine.objectContaining({
        page: 2,
        job: 10,
        status: "ACCEPTED"
      }));
    });
  });

  describe("self.onPageChange", function () {
    it("calls self.loadChange with the selectedPage", function () {
      spyOn(self, "loadChange");
      self.jobId = 10;
      self.onPageChange(6);
      expect(self.loadChange).toHaveBeenCalledWith(6, 10);
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
});
