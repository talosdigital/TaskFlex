describe("OfferRepliesCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, ownerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: 'offerReplies'
    };
    stateParams = {
      page: 2
    },
    ownerServiceMock = {
      getPendingOffers: function() { return $q.defer().promise },
    };
    authServiceMock = {
      authorize: function() { return true }
    };
    alertServiceMock = {
      buildError: function() { }
    };
    self = $controller('OfferRepliesCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      ownerService: ownerServiceMock,
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
    describe("when ownerService.getPendingOffers succeeds", function () {
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
        spyOn(ownerServiceMock, "getPendingOffers").and.returnValue(response.promise);
        self.retrieveOffers();
        response.resolve({ offers: offersMock });
        scope.$digest();
        expect(self.offers).toEqual(offersMock);
      }));

      it("stores the response totalPages self.pages", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getPendingOffers").and.returnValue(response.promise);
        self.retrieveOffers();
        response.resolve({ offers: [], totalPages: 5 });
        scope.$digest();
        expect(self.pages).toEqual(5);
      }));

      it("stores the response currentPage self.currentPage", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getPendingOffers").and.returnValue(response.promise);
        self.retrieveOffers();
        response.resolve({ offers: [], currentPage: 5 });
        scope.$digest();
        expect(self.currentPage).toEqual(5);
      }));
    });

    describe("when ownerService.getMyOffers fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPendingOffers").and.returnValue(response.promise);
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
          spyOn(ownerServiceMock, "getPendingOffers").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveOffers();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(ownerServiceMock, "getPendingOffers").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveOffers();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.reply", function () {
    it("goes to 'offerReply' state with the given offer id", function() {
      spyOn(state, "go");
      self.reply(44);
      expect(state.go).toHaveBeenCalledWith('offerReply', jasmine.objectContaining({
        offer: 44
      }));
    });
  });

  describe("self.onPageChange", function () {
    it("goes to the current state with the given selected page", function() {
      spyOn(state, "go");
      self.onPageChange(4);
      expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
        page: 4
      }));
    });
  });
});
