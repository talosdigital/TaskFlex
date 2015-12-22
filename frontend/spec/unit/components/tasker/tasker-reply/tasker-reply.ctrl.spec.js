describe("TaskerReplyCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, offerServiceMock, invitationServiceMock, categoryServiceMock,
      authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: 'taskerReply'
    };
    stateParams = {
      offer: 2,
      invitation: 3,
      accepting: 'true'
    },
    offerServiceMock = {
      getOffer: function() { return $q.defer().promise },
      updateOfferStatus: function() { return $q.defer().promise },
      createOffer: function() { return $q.defer().promise }
    };
    invitationServiceMock = {
      getInvitation: function() { return $q.defer().promise },
    };
    categoryServiceMock = {
      getCategory: function() { return $q.defer().promise }
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
    self = $controller('TaskerReplyCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      offerService: offerServiceMock,
      invitationService: invitationServiceMock,
      categoryService: categoryServiceMock,
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
    it("has the $stateParams.offer value by default", function () {
      expect(self.offerId).toEqual(stateParams.offer);
    });
  });

  describe("self.offerFound", function () {
    it("is true by default", function () {
      expect(self.offerFound).toBeTruthy();
    });
  });

  describe("self.invitationId", function () {
    it("has the $stateParams.invitation value by default", function () {
      expect(self.invitationId).toEqual(stateParams.invitation);
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

  describe("self.accepting", function () {
    it("has the $stateParams.accepting value by default", function () {
      expect(self.accepting).toEqual(stateParams.accepting);
    });
  });

  describe("self.job", function () {
    it("is an empty object by default", function () {
      expect(self.job).toEqual({});
    });
  });

  describe("self.tasker", function () {
    it("is an empty object by default", function () {
      expect(self.tasker).toEqual({});
    });
  });

  describe("self.reason", function () {
    it("is an empty string by default", function () {
      expect(self.reason).toEqual("");
    });
  });

  describe("self.retrieveOffer", function () {
    describe("when offerService.getOffer succeeds", function () {
      it("stores the response offers in self.offer and calls self.retrieveCategory", inject(function ($q) {
        var offerMock = {
          name: "Offer 1",
          description: "My description 1",
          job: {
            metadata: {
              category: {
                name: "Sales & Marketing"
              }
            }
          },
          invitation: {
            id: 4
          },
          metadata: {
            payment: {}
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
        // spyOn(self, "retrieveCategory");
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
        it("builds an error alert", inject(function ($q) {
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

  describe("self.retrieveInvitation", function () {
    describe("when invitationService.getInvitation succeeds", function () {
      it("stores the response offers in self.offer and calls self.retrieveCategory", inject(function ($q) {
        var invitationMock = {
          name: "Invitation 1",
          description: "My description 1",
          job: {
            metadata: {
              category: {
                name: "sales"
              },
              payment: {}
            }
          },
          owner: {}
        };
        expect(self.job).toEqual({});
        var response = $q.defer();
        spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
        self.retrieveInvitation(1);
        response.resolve(invitationMock);
        scope.$digest();
        expect(self.invitation).toEqual(invitationMock);
      }));

      it("stores the response job in self.job", inject(function ($q) {
        var invitationMock = {
          job: {
            metadata: {
              category: "sales"
            }
          },
          owner: {}
        };
        expect(self.job).toEqual({});
        var response = $q.defer();
        spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
        // spyOn(self, "retrieveCategory");
        self.retrieveInvitation(1);
        response.resolve(invitationMock);
        scope.$digest();
        expect(self.job).toEqual(invitationMock.job);
      }));
    });

    describe("when invitationService.getInvitation fails", function () {
      describe("when response status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveInvitation(1);
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when response status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
          spyOn(state, "go");;
          self.retrieveInvitation(1);
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when response status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveInvitation(1);
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
    describe("when self.offerFound is true", function () {
      describe("when the current offer status is 'RETURNED'", function () {
        it("returns true", function () {
          self.offerFound = true;
          self.offer.status = 'RETURNED';
          expect(self.canReply()).toBeTruthy();
        });
      });

      describe("when the current offer status is not 'RETURNED'", function () {
        it("returns false", function () {
          self.offerFound = true;
          self.offer.status = 'RESENT';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'ACCEPTED';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'SENT';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'CREATED';
          expect(self.canReply()).toBeFalsy();
        });
      });
    });

    describe("when self.invitationFound is true", function () {
      describe("when the current invitation status is 'SENT'", function () {
        it("returns true", function () {
          self.offerFound = false;
          self.invitationFound = true;
          self.invitation = {
            status: 'SENT'
          };
          expect(self.canReply()).toBeTruthy();
        });
      });

      describe("when the current offer status is not 'SENT'", function () {
        it("returns false", function () {
          self.offerFound = false;
          self.invitationFound = true;
          self.invitation = {
            status: 'RESENT'
          };
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'ACCEPTED';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'RETURNED';
          expect(self.canReply()).toBeFalsy();
          self.offer.status = 'CREATED';
          expect(self.canReply()).toBeFalsy();
        });
      });
    });

    describe("when self.offerFound and self.invitationFound are false", function () {
      it("returns false", function () {
        self.offerFound = self.invitationFound = false;
        expect(self.canReply()).toBeFalsy();
      });
    });
  });

  describe("self.reply", function () {
    describe("when the form was invalid", function () {
      it("doesn't call offerService.updateOfferStatus", function () {
        spyOn(offerServiceMock, "updateOfferStatus");
        self.reply(false);
        expect(offerServiceMock.updateOfferStatus).not.toHaveBeenCalled();
      });
    });

    describe("when the form was valid", function () {
      it("calls offerService.updateOfferStatus with the current offerId and written reason",
        inject(function ($q) {
          self.offerId = 44;
          self.reason = "my-reason";
          spyOn(offerServiceMock, "updateOfferStatus").and.returnValue($q.defer().promise);
          self.reply(true);
          expect(offerServiceMock.updateOfferStatus).toHaveBeenCalledWith(44, 'resend',
            jasmine.objectContaining({
              reason: 'my-reason'
          }));
      }));
    });

    describe("when offerService.updateOfferStatus succeeds", function () {
      it("builds a success alert and goes to jobApplications state", inject(function ($q) {
        var response = $q.defer();
        spyOn(offerServiceMock, "updateOfferStatus").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildSuccess");
        spyOn(state, "go");
        self.reply(true);
        response.resolve();
        scope.$digest();
        expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith('jobApplications', jasmine.anything());
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
        it("shows an error alert", inject(function ($q) {
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

  describe("self.makeAnOffer", function () {
    describe("when validForm parameter is false", function () {
      it("doesn't call offerService.createOffer method", function () {
        spyOn(offerServiceMock, "createOffer");
        self.makeAnOffer(false);
        expect(offerServiceMock.createOffer).not.toHaveBeenCalled();
      });
    });

    describe("when validForm parameter is true", function () {
      describe("when offerService.createOffer succeeds", function () {
        it("builds a success alert and goes to taskerReply state", inject(function ($q) {
          var response = $q.defer();
          var offerMock = {
            id: 4
          };
          spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildSuccess");
          spyOn(state, "go");
          self.makeAnOffer(true);
          response.resolve(offerMock);
          scope.$digest();
          expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
          expect(state.go).toHaveBeenCalledWith('taskerReply', jasmine.objectContaining({
            offer: 4
          }));
        }));
      });
    });

    describe("when offerService.createOffer fails", function () {
      describe("when the response status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.makeAnOffer(true);
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
          spyOn(state, "go");
          self.makeAnOffer(true);
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response status is nither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(offerServiceMock, "createOffer").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.makeAnOffer(true);
          response.reject({ status: 405, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.cancel", function () {
    describe("when self.offerFound is true", function () {
      it("goes to jobApplications state", function () {
        self.offerFound = true;
        spyOn(state, "go");
        self.cancel();
        expect(state.go).toHaveBeenCalledWith('jobApplications', jasmine.anything());
      });
    });

    describe("when self.offerFound is false", function () {
      describe("when self.invitation.id is defined", function () {
        it("goes to invitationDetails state with the invitation id", function () {
          self.invitation = {
            id: 51
          };
          self.offerFound = false;
          spyOn(state, "go");
          self.cancel();
          expect(state.go).toHaveBeenCalledWith('invitationDetails', jasmine.objectContaining({
            id: 51
          }));
        });
      });

      describe("when neither invitation nor invitation id are not defined", function () {
        it("goes to taskerInvitations state", function () {
          spyOn(state, "go");
          self.offerFound = false;
          self.cancel();
          expect(state.go).toHaveBeenCalledWith('taskerInvitations', jasmine.anything());
        });
      });
    });
  });
});
