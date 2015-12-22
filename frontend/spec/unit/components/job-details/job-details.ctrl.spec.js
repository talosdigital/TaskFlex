describe("JobDetailsCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, localStorage, cookies, jobServiceMock, ownerServiceMock,
      taskerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { }
    };
    stateParams = {
      job: 4
    };
    localStorage = { };
    cookies = {
      get: function() { }
    };
    jobServiceMock = {
      getJobById: function() { return $q.defer().promise }
    };
    ownerServiceMock = {
      getJobById: function() { return $q.defer().promise }
    };
    taskerServiceMock = {
      getOfferJobById: function() { return $q.defer().promise }
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
    self = $controller('JobDetailsCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      $localStorage: localStorage,
      $cookies: cookies,
      jobService: jobServiceMock,
      ownerService: ownerServiceMock,
      taskerService: taskerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.jobId", function () {
    it("takes the same value of $stateParams.job", function () {
      expect(self.jobId).toEqual(stateParams.job);
    });
  });

  describe("self.isMyJob", function () {
    it("is false by default", function () {
      expect(self.isMyJob).toBeFalsy();
    });
  });

  describe("self.retrieveJob", function () {
    describe("when jobService.getJobById succeeds", function () {
      it("stores the response in self.job", inject(function ($q) {
        var jobMock = {
          name: "My job 1",
          description: "This job is amazing",
          metadata: { }
        };
        var response = $q.defer();
        spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
        self.retrieveJob();
        response.resolve(jobMock);
        scope.$digest();
        expect(self.job).toEqual(jobMock);
      }));
    });

    describe("when jobService.getOfferJobById fails", function () {
      it('builds a failure alert', inject(function($q) {
        expect(self.alert).toBeUndefined();
        var response = $q.defer();
        spyOn(jobServiceMock, 'getJobById').and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        self.retrieveJob();
        response.reject({ status: 400, data: {} });
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      }));
    });
  });

  describe("self.checkIfIsMyJob", function () {
    describe("when the cookies doesn't have any token", function () {
      it("does not call ownerService.getJobById method", function () {
        spyOn(ownerServiceMock, "getJobById");
        spyOn(cookies, "get").and.returnValue(undefined);
        self.checkIfIsMyJob();
        expect(ownerServiceMock.getJobById).not.toHaveBeenCalled();
      });
    });

    describe("when localStorage doesn't have any user", function () {
      it("does not call ownerService.getJobById method", function () {
        spyOn(ownerServiceMock, "getJobById");
        spyOn(cookies, "get").and.returnValue('my-user-token');
        localStorage.user = undefined;
        self.checkIfIsMyJob();
        expect(ownerServiceMock.getJobById).not.toHaveBeenCalled();
      });
    });

    describe("when localStorage has a user but it is not 'owner'", function () {
      it("does not call ownerService.getJobById method", function () {
        spyOn(ownerServiceMock, "getJobById");
        spyOn(cookies, "get").and.returnValue('my-user-token');
        localStorage.user = {
          roles: [ "tasker" ]
        };
        self.checkIfIsMyJob();
        expect(ownerServiceMock.getJobById).not.toHaveBeenCalled();
      });
    });

    describe("when ownerService.getJobById succeeds", function () {
      it("sets self.isMyJob to true", inject(function ($q) {
        expect(self.isMyJob).toBeFalsy();
        spyOn(cookies, "get").and.returnValue('my-user-token');
        localStorage.user = {
          roles: ['owner']
        };
        var response = $q.defer();
        spyOn(ownerServiceMock, "getJobById").and.returnValue(response.promise);
        self.checkIfIsMyJob();
        response.resolve();
        scope.$digest();
        expect(self.isMyJob).toBeTruthy();
      }));
    });
  });

  describe("self.checkIfAlreadyApplied", function () {
    describe("when the cookies doesn't have any token", function () {
      it("does not call taskerService.getOfferJobById method", function () {
        spyOn(taskerServiceMock, "getOfferJobById");
        spyOn(cookies, "get").and.returnValue(undefined);
        self.checkIfAlreadyApplied();
        expect(taskerServiceMock.getOfferJobById).not.toHaveBeenCalled();
      });
    });

    describe("when localStorage doesn't have any user", function () {
      it("does not call taskerService.getOfferJobById method", function () {
        spyOn(taskerServiceMock, "getOfferJobById");
        spyOn(cookies, "get").and.returnValue('my-user-token');
        localStorage.user = undefined;
        self.checkIfAlreadyApplied();
        expect(taskerServiceMock.getOfferJobById).not.toHaveBeenCalled();
      });
    });

    describe("when localStorage has a user but it is not 'owner'", function () {
      it("does not call taskerService.getOfferJobById method", function () {
        spyOn(taskerServiceMock, "getOfferJobById");
        spyOn(cookies, "get").and.returnValue('my-user-token');
        localStorage.user = {
          roles: [ "owner" ]
        };
        self.checkIfAlreadyApplied();
        expect(taskerServiceMock.getOfferJobById).not.toHaveBeenCalled();
      });
    });

    describe("when taskerService.getOfferJobById succeeds", function () {
      it("doesn't modify self.alreadyApplied. Leaves it set to true", inject(function ($q) {
        spyOn(cookies, "get").and.returnValue('my-user-token');
        localStorage.user = {
          roles: ['tasker']
        };
        var response = $q.defer();
        spyOn(taskerServiceMock, "getOfferJobById").and.returnValue(response.promise);
        self.checkIfAlreadyApplied();
        response.resolve();
        scope.$digest();
        expect(self.alreadyApplied).toBeTruthy();
      }));
    });

    describe("when taskerService.getOfferJobById fails", function () {
      it("sets self.alreadyApplied to false", inject(function ($q) {
        self.alreadyApplied = true;
        spyOn(cookies, "get").and.returnValue('my-user-token');
        localStorage.user = {
          roles: ['tasker']
        };
        var response = $q.defer();
        spyOn(taskerServiceMock, "getOfferJobById").and.returnValue(response.promise);
        self.checkIfAlreadyApplied();
        response.reject();
        scope.$digest();
        expect(self.alreadyApplied).toBeFalsy();
      }));
    });
  });

  describe("self.apply", function () {
    it("goes to applyJob state with the current job id", function () {
      spyOn(state, "go");
      self.jobId = 6;
      self.apply();
      expect(state.go).toHaveBeenCalledWith('applyJob', jasmine.objectContaining({
        id: 6
      }));
    });
  });

  describe("self.edit", function () {
    it("goes to 'postJob' state with the job id as a parameter", function () {
      spyOn(state, "go");
      self.jobId = 5;
      self.edit();
      expect(state.go).toHaveBeenCalledWith('postJob', jasmine.objectContaining({
        edit: 5
      }));
    });
  });
});
