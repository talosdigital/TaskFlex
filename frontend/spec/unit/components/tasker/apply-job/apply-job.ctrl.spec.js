describe("ApplyJobCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, localStorage, jobServiceMock, offerServiceMock,
      authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
    };
    stateParams = {
      id: 2
    };
    localStorage = {
      user: {
        firstName: "Santiago"
      }
    };
    jobServiceMock = {
      getJobById: function() { return $q.defer().promise }
    };
    offerServiceMock = {
      createOffer: function() { return $q.defer().promise }
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
    self = $controller('ApplyJobCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      $localStorage: localStorage,
      jobService: jobServiceMock,
      offerService: offerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.jobId", function () {
    it("takes the $stateParams.id value by default", function () {
      expect(self.jobId).toEqual(2);
    });
  });

  describe("self.job", function () {
    it("is an empty object by default", function () {
      expect(self.job).toEqual({});
    });
  });

  describe("self.offer", function () {
    it("is defined by default. Also the payment currency name", function () {
      expect(self.offer).toBeDefined();
      expect(self.offer.metadata.payment.currency.name).toEqual('USD');
    });
  });

  describe("self.jobFound", function () {
    it("is true by default", function () {
      expect(self.jobFound).toBeTruthy();
    });
  });

  describe("self.retrieveJob", function () {
    describe("when self.jobId is not defined", function () {
      it("sets self.jobFound to false and builds an alert", function () {
        self.jobFound = true;
        self.jobId = undefined;
        spyOn(alertServiceMock, "buildError");
        self.retrieveJob();
        expect(self.jobFound).toBeFalsy();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      });

      it("doesn't call jobService.getJobById", function () {
        self.jobFound = true;
        self.jobId = undefined;
        spyOn(jobServiceMock, "getJobById");
        self.retrieveJob();
        expect(jobServiceMock.getJobById).not.toHaveBeenCalled();
      });
    });

    describe("when jobService.getJobById succeeds", function () {
      it("sets the response data to self.job", inject(function ($q) {
        var jobMock = {
          name: "my-job-name",
          description: "my-job-description"
        };
        var response = $q.defer();
        spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
        self.retrieveJob();
        response.resolve(jobMock);
        scope.$digest();
        expect(self.job).toEqual(jobMock);
      }));

      it("sets additional response data to offer object", inject(function ($q) {
        var jobMock = {
          name: "my-job-name",
          description: "my-job-description",
          id: 44,
          metadata: {
            hello: 'morning'
          }
        };
        var response = $q.defer();
        spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
        self.retrieveJob();
        response.resolve(jobMock);
        scope.$digest();
        expect(self.offer.jobId).toEqual(44);
        expect(self.offer.metadata).toEqual({ hello: 'morning' });
      }));
    });

    describe("when jobService.getJobById fails", function () {
      it("builds an error alert", inject(function ($q) {
        var response = $q.defer();
        spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        self.retrieveJob();
        response.reject();
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
        expect(self.jobFound).toBeFalsy();
      }));
    });
  });

  describe("self.sendApplication", function () {
    describe("when offerService.createOffer succeeds", function () {
      it("goes to taskerReply state with the response id and a success alert", inject(function ($q) {
        var offerMock = {
          id: 1231
        };
        var response = $q.defer();
        spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
        spyOn(state, "go");
        self.sendApplication();
        response.resolve(offerMock);
        scope.$digest();
        expect(state.go).toHaveBeenCalledWith('taskerReply', jasmine.objectContaining({
          offer: 1231,
          alert: jasmine.objectContaining({
            error: false
          })
        }));
      }));
    });

    describe("when offerService.createOffer fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.sendApplication();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
          spyOn(state, "go");
          self.sendApplication();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.sendApplication();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.cancel", function () {
    it("goes to jobDetails state with the current jobId", function () {
      self.jobId = 44;
      spyOn(state, "go");
      self.cancel();
      expect(state.go).toHaveBeenCalledWith('jobDetails', jasmine.objectContaining({
        job: 44
      }))
    });
  });
});
