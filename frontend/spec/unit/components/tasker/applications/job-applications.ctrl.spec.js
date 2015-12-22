describe("JobApplicationsCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, taskerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: 'jobApplications'
    };
    stateParams = {
      page: 2
    },
    taskerServiceMock = {
      getMyOffers: function() { return $q.defer().promise },
      updateOfferStatus: function() { return $q.defer().promise }
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
    self = $controller('JobApplicationsCtrl', {
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

  describe("self.offers", function () {
    it("has an empty array as default value", function () {
      expect(self.offers).toEqual([]);
    });
  });

  describe("self.retrieveOffers", function () {
    describe("when taskerService.getMyOffers succeeds", function () {
      it("stores the response offers in self.offers", inject(function ($q) {
        var offersMock = [
          {
            name: "Offer 1",
            description: "My description 1"
          },
          {
            name: "Offer 2",
            description: "My description 2"
          }
        ];
        expect(self.offers).toEqual([]);
        var response = $q.defer();
        spyOn(taskerServiceMock, "getMyOffers").and.returnValue(response.promise);
        self.retrieveOffers();
        response.resolve({ offers: offersMock });
        scope.$digest();
        expect(self.offers).toEqual(offersMock);
      }));

      it("stores the response totalPages self.pages", inject(function ($q) {
        var response = $q.defer();
        spyOn(taskerServiceMock, "getMyOffers").and.returnValue(response.promise);
        self.retrieveOffers();
        response.resolve({ offers: [], totalPages: 5 });
        scope.$digest();
        expect(self.pages).toEqual(5);
      }));

      it("stores the response currentPage self.currentPage", inject(function ($q) {
        var response = $q.defer();
        spyOn(taskerServiceMock, "getMyOffers").and.returnValue(response.promise);
        self.retrieveOffers();
        response.resolve({ offers: [], currentPage: 5 });
        scope.$digest();
        expect(self.currentPage).toEqual(5);
      }));
    });

    describe("when taskerService.getMyOffers fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyOffers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveOffers();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyOffers").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveOffers();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyOffers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveOffers();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.offerStatus", function () {
    describe("when the given offer has 'ACCEPTED' status", function () {
      it("returns 'ACCEPTED'", function () {
        expect(self.offerStatus({ status: 'ACCEPTED' })).toEqual('ACCEPTED');
      });
    });

    describe("when the given offer has 'REJECTED' status", function () {
      it("returns 'REJECTED'", function () {
        expect(self.offerStatus({ status: 'REJECTED' })).toEqual('REJECTED');
      });
    });

    describe("when the given offer has 'WITHDRAWN' status", function () {
      it("returns 'WITHDRAWN'", function () {
        expect(self.offerStatus({ status: 'WITHDRAWN' })).toEqual('WITHDRAWN');
      });
    });

    describe("when the given offer has 'SENT' status", function () {
      it("returns 'PENDING'", function () {
        expect(self.offerStatus({ status: 'SENT' })).toEqual('PENDING');
      });
    });

    describe("when the given offer has 'RETURNED' status", function () {
      it("returns 'RETURNED'", function () {
        expect(self.offerStatus({ status: 'RETURNED' })).toEqual('RETURNED');
      });
    });

    describe("when the given offer has 'RESENT' status", function () {
      it("returns 'PENDING'", function () {
        expect(self.offerStatus({ status: 'RESENT' })).toEqual('PENDING');
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

  describe("self.viewDetails", function () {
    it("goes to 'taskerReply' state with the given jobId as a part of parameter", function () {
      spyOn(state, "go");
      self.viewDetails(3);
      expect(state.go).toHaveBeenCalledWith('taskerReply', jasmine.objectContaining({
        offer: 3
      }));
    });
  });

  describe("self.isWithdrawable", function () {
    describe("when the given status is 'RETURNED' or 'SENT'", function () {
      it("returns true", function () {
        expect(self.isWithdrawable('RETURNED')).toBeTruthy();
        expect(self.isWithdrawable('SENT')).toBeTruthy();
      });
    });

    describe("when the given status is not 'RETURNED' nor 'SENT'", function () {
      it("returns false", function () {
        expect(self.isWithdrawable('ACCEPTED')).toBeFalsy();
        expect(self.isWithdrawable('CREATED')).toBeFalsy();
        expect(self.isWithdrawable('REJECTED')).toBeFalsy();
        expect(self.isWithdrawable('WITHDRAWN')).toBeFalsy();
      });
    });
  });

  describe("self.isResendable", function () {
    describe("when the given status is 'WITHDRAWN' or 'RETURNED'", function () {
      it("returns true", function () {
        expect(self.isResendable('RETURNED')).toBeTruthy();
      });
    });

    describe("when the given status is not 'WITHDRAWN' nor 'RETURNED'", function () {
      it("returns false", function () {
        expect(self.isResendable('ACCEPTED')).toBeFalsy();
        expect(self.isResendable('CREATED')).toBeFalsy();
        expect(self.isResendable('REJECTED')).toBeFalsy();
        expect(self.isResendable('SENT')).toBeFalsy();
      });
    });
  });

  describe("self.isSendable", function () {
    describe("when the given status is 'CREATED'", function () {
      it("returns true", function () {
        expect(self.isSendable('CREATED')).toBeTruthy();
      });
    });

    describe("when the given status is not 'CREATED'", function () {
      it("returns false", function () {
        expect(self.isSendable('ACCEPTED')).toBeFalsy();
        expect(self.isSendable('RESENT')).toBeFalsy();
        expect(self.isSendable('SENT')).toBeFalsy();
        expect(self.isSendable('REJECTED')).toBeFalsy();
        expect(self.isSendable('WITHDRAWN')).toBeFalsy();
        expect(self.isSendable('RETURNED')).toBeFalsy();
      });
    });
  });

  describe("self.toggleWithdrawing", function () {
    it("sets the given offer to self.withdrawing", function () {
      self.withdrawing = undefined;
      self.toggleWithdrawing({ name: 'my-offer' });
      expect(self.withdrawing).toEqual({ name: 'my-offer' });
    });
  });

  describe("self.withdrawOffer", function () {
    describe("when taskerService.updateOfferStatus succeeds", function () {
      it("builds a success alert and goes to the current state", inject(function ($q) {
        self.currentPage = 2;
        var response = $q.defer();
        spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildSuccess");
        spyOn(state, "go");
        self.withdrawOffer(50);
        expect(taskerServiceMock.updateOfferStatus).toHaveBeenCalledWith(50, 'withdraw');
        response.resolve({});
        scope.$digest();
        expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
          page: 2
        }));
      }));
    });

    describe("when taskerService.updateOfferStatus fails", function () {
      describe("when the response.status is 400", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.withdrawOffer();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(state, "go");
          self.withdrawOffer();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.withdrawOffer();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.resendOffer", function () {
    describe("when taskerService.updateOfferStatus succeeds", function () {
      it("builds a success alert and goes to the current state", inject(function ($q) {
        self.currentPage = 2;
        var response = $q.defer();
        spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildSuccess");
        spyOn(state, "go");
        self.resendOffer(50);
        expect(taskerServiceMock.updateOfferStatus).toHaveBeenCalledWith(50, 'resend');
        response.resolve({});
        scope.$digest();
        expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
          page: 2
        }));
      }));
    });

    describe("when taskerService.updateOfferStatus fails", function () {
      describe("when the response.status is 400", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.resendOffer();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(state, "go");
          self.resendOffer();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.resendOffer();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.sendOffer", function () {
    describe("when taskerService.updateOfferStatus succeeds", function () {
      it("builds an error alert and goes to the current state", inject(function ($q) {
        self.currentPage = 2;
        var response = $q.defer();
        spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildSuccess");
        spyOn(state, "go");
        self.sendOffer(50);
        expect(taskerServiceMock.updateOfferStatus).toHaveBeenCalledWith(50, 'send');
        response.resolve({});
        scope.$digest();
        expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
          page: 2
        }));
      }));
    });

    describe("when taskerService.updateOfferStatus fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.sendOffer();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(state, "go");
          self.sendOffer();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.sendOffer();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });
});
