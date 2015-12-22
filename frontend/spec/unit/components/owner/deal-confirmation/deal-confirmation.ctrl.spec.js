describe("DealConfirmationCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, offerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
    };
    stateParams = {
      offer: {
        id: 44,
        name: 'my-offer',
        job: {
          name: 'my-job'
        }
      },
      id: 44
    },
    offerServiceMock = {
      getOffer: function() { return $q.defer().promise }
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
    self = $controller('DealConfirmationCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      offerService: offerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.offer", function () {
    it("takes the $stateParams.offer value by default", function () {
      expect(self.offer).toEqual(stateParams.offer);
    });
  });

  describe("self.offerId", function () {
    it("has the $stateParams.id value", function () {
      expect(self.offerId).toEqual(stateParams.id);
    });
  });

  describe("self.offerFound", function () {
    it("is true by default", function () {
      expect(self.offerFound).toBeTruthy();
    });
  });

  describe("self.job", function () {
    it("is defined by default", function () {
      expect(self.job).toBeDefined();
    });
  });

  describe("self.shouldRetrieveOffer", function () {
    describe("when self.offer is defined", function () {
      it("sets the self.offer job to self.job and returns false", function () {
        self.offer = {
          job: {
            name: 'pretty-job',
            description: 'this job is nice'
          }
        };
        expect(self.shouldRetrieveOffer(0)).toBeFalsy();
        expect(self.job).toEqual(self.offer.job);
      });
    });

    describe("when self.offer and the given offerId are undefined", function () {
      it("sets offerFound to false", function () {
        self.offer = undefined;
        self.offerFound = true;
        self.shouldRetrieveOffer(undefined);
        expect(self.offerFound).toBeFalsy();
      });

      it("builds an error alert", function () {
        self.offer = undefined;
        spyOn(alertServiceMock, "buildError");
        self.shouldRetrieveOffer(undefined);
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      });

      it("returns false", function () {
        self.offer = undefined;
        expect(self.shouldRetrieveOffer(undefined)).toBeFalsy();
      });
    });

    describe("when self.offer is not defined but the given offerId is", function () {
      it("returns true", function () {
        self.offer = undefined;
        expect(self.shouldRetrieveOffer(1)).toBeTruthy();
      });
    });
  });

  describe("self.retrieveOffer", function () {
    describe("when self.shouldRetrieveOffer returns false", function() {
      it("doesn't call the offerService", function() {
        spyOn(self, "shouldRetrieveOffer").and.returnValue(false);
        spyOn(offerServiceMock, "getOffer");
        self.retrieveOffer(4);
        expect(offerServiceMock.getOffer).not.toHaveBeenCalled();
      });
    });

    describe("when offerService.getOffer succeeds", function () {
      it("stores the response offer and job in self.offer and self.job", inject(function ($q) {
        var offerMock = {
          name: "Offer 1",
          description: "My description 1",
          job: {
            metadata: {
              category: "sales"
            }
          }
        };
        self.offer = {};
        var response = $q.defer();
        spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
        spyOn(self, "shouldRetrieveOffer").and.returnValue(true);
        self.retrieveOffer(1);
        response.resolve(offerMock);
        scope.$digest();
        expect(self.offer).toEqual(offerMock);
        expect(self.job).toEqual(offerMock.job);
      }));
    });

    describe("when offerService.getOffer fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
          spyOn(self, "shouldRetrieveOffer").and.returnValue(true);
          spyOn(alertServiceMock, "buildError");
          self.retrieveOffer(1);
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
          spyOn(state, "go");
          spyOn(self, "shouldRetrieveOffer").and.returnValue(true);
          self.retrieveOffer(1);
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
          spyOn(self, "shouldRetrieveOffer").and.returnValue(true);
          spyOn(alertServiceMock, "buildError");
          self.retrieveOffer(1);
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });
});
