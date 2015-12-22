describe("ReplyOfferCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, offerServiceMock, authServiceMock,
      alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: 'replyOffer'
    };
    stateParams = {
      offer: 2
    },
    offerServiceMock = {
      getOffer: function() { return $q.defer().promise },
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
    self = $controller('ReplyOfferCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      offerService: offerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.offer", function () {
    it("is an empty object by default", function () {
      expect(self.offer).toEqual({});
    });
  });

  describe("self.offerId", function () {
    it("has the $stateParams.offer value", function () {
      expect(self.offerId).toEqual(stateParams.offer);
    });
  });

  describe("self.offerFound", function () {
    it("is true by default", function () {
      expect(self.offerFound).toBeTruthy();
    });
  });

  describe("self.records", function () {
    it("is an empty array by default", function () {
      expect(self.records).toEqual([]);
    });
  });

  describe("self.invitation", function () {
    it("is not defined by default", function () {
      expect(self.invitation).toBeUndefined();
    });
  });

  describe("self.reason", function () {
    it("is an empty string by default", function () {
      expect(self.reason).toEqual("");
    });
  });

  describe("self.accepting", function () {
    it("is false by default", function () {
      expect(self.accepting).toBeFalsy();
    });
  });

  describe("self.rejecting", function () {
    it("is false by default", function () {
      expect(self.rejecting).toBeFalsy();
    });
  });

  describe("self.retrieveOffer", function () {
    describe("when the given offerId is undefined", function() {
      it("builds an alert message and doesn't call the offerService", function() {
        expect(self.alert).toBeUndefined();
        spyOn(offerServiceMock, "getOffer");
        spyOn(alertServiceMock, "buildError");
        self.retrieveOffer();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
        expect(offerServiceMock.getOffer).not.toHaveBeenCalled();
      });
    });

    describe("when offerService.getOffer succeeds", function () {
      it("stores the response offers in self.offer", inject(function ($q) {
        var offerMock = {
          name: "Offer 1",
          description: "My description 1",
          job: {
            metadata: {
              category: "sales"
            }
          },
          invitation: {
            id: "4"
          }
        };
        expect(self.offer).toEqual({});
        var response = $q.defer();
        spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
        self.retrieveOffer(1);
        response.resolve(offerMock);
        scope.$digest();
        expect(self.offer).toEqual(offerMock);
      }));

      it("stores the response records in self.records", inject(function ($q) {
        var offerMock = {
          records: [
            {
              recordType: "CREATED",
              description: "First record"
            },
            {
              recordType: "SENT",
              description: "Second record"
            }
          ]
        };
        expect(self.records).toEqual([]);
        var response = $q.defer();
        spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
        self.retrieveOffer(1);
        response.resolve(offerMock);
        scope.$digest();
        expect(self.records).toEqual(offerMock.records);
      }));
    });

    describe("when offerService.getOffer fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
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
          self.retrieveOffer(1);
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "getOffer").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveOffer(1);
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.isTaskerRecord", function () {
    describe("when the given record type is 'CREATED', 'SENT' or 'RESENT'", function () {
      it("returns true", function () {
        expect(self.isTaskerRecord({ recordType: 'CREATED' })).toBeTruthy();
        expect(self.isTaskerRecord({ recordType: 'SENT' })).toBeTruthy();
        expect(self.isTaskerRecord({ recordType: 'RESENT' })).toBeTruthy();
      });
    });

    describe("when the given record type is not 'CREATED', 'SENT' nor 'RESENT'", function () {
      it("returns false", function () {
        expect(self.isTaskerRecord({ recordType: 'RETURNED' })).toBeFalsy();
        expect(self.isTaskerRecord({ recordType: 'WITHDRAWN' })).toBeFalsy();
        expect(self.isTaskerRecord({ recordType: 'ACCEPTED' })).toBeFalsy();
        expect(self.isTaskerRecord({ recordType: 'REJECTED' })).toBeFalsy();
      });
    });
  });

  describe("self.canReply", function () {
    describe("when the current offer status is 'SENT' or 'RESENT'", function () {
      describe("when accepting and rejecting are both false", function () {
        it("returns true", function () {
          self.accepting = self.rejecting = false;
          self.offer.status = 'SENT';
          expect(self.canReply()).toBeTruthy();
          self.offer.status = 'RESENT';
          expect(self.canReply()).toBeTruthy();
        });
      });

      describe("when accepting or rejecting is false", function () {
        it("returns false", function () {
          self.accepting = false;
          self.rejecting = true;
          self.offer.status = 'SENT';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'RESENT';
          expect(self.canReply()).toBeFalsy();
        });
      });
    });

    describe("when the current offer status is not 'SENT' nor 'RESENT'", function () {
      describe("when accepting and rejecting are both false", function () {
        it("returns false", function () {
          self.accepting = self.rejecting = false;
          self.offer.status = 'RETURNED';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'ACCEPTED';
          expect(self.canReply()).toBeFalsy();
        });
      });

      describe("when accepting or rejecting is false", function () {
        it("returns false", function () {
          self.accepting = true;
          self.rejecting = false;
          self.offer.status = 'RETURNED';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'ACCEPTED';
          expect(self.canReply()).toBeFalsy();
        });
      });
    });
  });

  describe("self.reply", function () {
    describe("when form was invalid", function () {
      it("doesn't call offerService.updateOfferStatus method", function () {
        spyOn(offerServiceMock, "updateOfferStatus");
        self.reply(false);
        expect(offerServiceMock.updateOfferStatus).not.toHaveBeenCalled();
      });
    });

    describe("when form is valid", function () {
      it("calls offerService.updateOfferStatus with the current offerId and written reason",
        inject(function ($q) {
          self.offerId = 44;
          self.reason = "my-reason";
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue($q.defer().promise);
          self.reply(true);
          expect(offerServiceMock.updateOfferStatus).toHaveBeenCalledWith(44, 'return',
            jasmine.objectContaining({
              reason: 'my-reason'
          }));
      }));
    });

    describe("when offerService.updateOfferStatus succeeds", function () {
      it("goes to myOffers.currentOffers with a success alert", inject(function ($q) {
        var response = $q.defer();
        spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
        spyOn(state, "go");
        self.reply(true);
        response.resolve();
        scope.$digest();
        expect(state.go).toHaveBeenCalledWith('myOffers.currentOffers', jasmine.objectContaining({
          alert: jasmine.objectContaining({
            error: false
          })
        }));
      }));
    });

    describe("when offerService.updateOfferStatus fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.reply(true);
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(state, "go");
          self.reply(true);
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.reply(true);
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.toggleAccepting", function () {
    describe("when self.accepting is true", function () {
      it("sets it to false", function () {
        self.accepting = true;
        self.toggleAccepting();
        expect(self.accepting).toBeFalsy();
      });
    });

    describe("when self.accepting is false", function () {
      it("sets it to true", function () {
        self.accepting = false;
        self.toggleAccepting();
        expect(self.accepting).toBeTruthy();
      });
    });
  });

  describe("self.accept", function () {
    it("calls offerService.updateOfferStatus with the current offerId", inject(function ($q) {
        self.offerId = 44;
        spyOn(offerServiceMock, "updateOfferStatus").and.returnValue($q.defer().promise);
        self.accept();
        expect(offerServiceMock.updateOfferStatus).toHaveBeenCalledWith(44, 'accept',
                                                                        jasmine.anything());
    }));

    describe("when offerService.updateOfferStatus succeeds", function () {
      it("goes to dealConfirmation with a the offer retrieved", inject(function ($q) {
        var offerMock = {
          id: 55,
          name: "my-little-offer"
        };
        var response = $q.defer();
        spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
        spyOn(state, "go");
        self.accept();
        response.resolve(offerMock);
        scope.$digest();
        expect(state.go).toHaveBeenCalledWith('dealConfirmation', jasmine.objectContaining({
          id: 55,
          offer: offerMock
        }));
      }));
    });

    describe("when offerService.updateOfferStatus fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.accept();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(state, "go");
          self.accept();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.accept();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.toggleRejecting", function () {
    describe("when self.rejecting is true", function () {
      it("sets it to false", function () {
        self.rejecting = true;
        self.toggleRejecting();
        expect(self.rejecting).toBeFalsy();
      });
    });

    describe("when self.rejecting is false", function () {
      it("sets it to true", function () {
        self.rejecting = false;
        self.toggleRejecting();
        expect(self.rejecting).toBeTruthy();
      });
    });
  });

  describe("self.decline", function () {
    it("calls offerService.updateOfferStatus with the current offerId", inject(function ($q) {
        self.offerId = 44;
        spyOn(offerServiceMock, "updateOfferStatus").and.returnValue($q.defer().promise);
        self.decline();
        expect(offerServiceMock.updateOfferStatus).toHaveBeenCalledWith(44, 'reject',
                                                                        jasmine.anything());
    }));

    describe("when offerService.updateOfferStatus succeeds", function () {
      it("goes to myOffers.currentOffers with a success alert", inject(function ($q) {
        var response = $q.defer();
        spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
        spyOn(state, "go");
        self.decline();
        response.resolve();
        scope.$digest();
        expect(state.go).toHaveBeenCalledWith('myOffers.currentOffers', jasmine.objectContaining({
          alert: jasmine.objectContaining({
            error: false
          })
        }));
      }));
    });

    describe("when offerService.updateOfferStatus fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.decline();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(state, "go");
          self.decline();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.decline();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });
});
