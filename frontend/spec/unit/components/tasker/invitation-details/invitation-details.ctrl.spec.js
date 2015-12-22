describe("InvitationDetailsCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, invitationServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: 'invitationDetails'
    };
    stateParams = {
      id: 2
    },
    invitationServiceMock = {
      updateInvitationStatus: function() { return $q.defer().promise },
      getInvitation: function() { return $q.defer().promise }
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
    self = $controller('InvitationDetailsCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      invitationService: invitationServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.invitationId", function () {
    it("has the $stateParams.id value by default", function () {
      expect(self.invitationId).toEqual(2);
    });
  });

  describe("self.invitation", function () {
    it("is an empty object by default", function () {
      expect(self.invitation).toEqual({});
    });
  });

  describe("self.rejectConfirm", function () {
    it("is false by default", function () {
      expect(self.rejectConfirm).toBeFalsy();
    });
  });

  describe("self.retrieveInvitation", function () {
    describe("when invitationService.getInvitation succeeds", function () {
      it("stores the response invitation in self.invitations", inject(function ($q) {
        var invitationMock = {
          name: "Invitation 1",
          description: "My description 1",
          job: {
            metadata: {
              category: 'my-cat'
            }
          }
        };
        expect(self.invitation).toEqual({});
        var response = $q.defer();
        spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
        self.retrieveInvitation();
        response.resolve(invitationMock);
        scope.$digest();
        expect(self.invitation).toEqual(invitationMock);
      }));
    });

    describe("when invitationService.getInvitation fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveInvitation();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveInvitation();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(invitationServiceMock, "getInvitation").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveInvitation();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.reply", function () {
    it("goes to taskerReply state with the current invitation id", function () {
      spyOn(state, "go");
      self.reply();
      expect(state.go).toHaveBeenCalledWith('taskerReply', jasmine.objectContaining({
        invitation: self.invitationId
      }));
    });
  });

  describe("self.reject", function () {
    describe("when invitationService.updateInvitationStatus succeeds", function () {
      it("builds a success alert and goes to taskerInvitations", inject(function ($q) {
        var response = $q.defer();
        spyOn(invitationServiceMock, "updateInvitationStatus").and.returnValue(response.promise);
        spyOn(state, "go");
        spyOn(alertServiceMock, "buildSuccess");
        self.reject();
        response.resolve();
        scope.$digest();
        expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith('taskerInvitations', jasmine.anything());
      }));
    });

    describe("when invitationService.updateInvitationStatus fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(invitationServiceMock, "updateInvitationStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.reject();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(invitationServiceMock, "updateInvitationStatus").and.returnValue(response.promise);
          spyOn(state, "go");
          self.reject();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(invitationServiceMock, "updateInvitationStatus").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.reject();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.toggleRejectConfirm", function () {
    it("inverts the value of self.rejectConfirm", function () {
      self.rejectConfirm = true;
      self.toggleRejectConfirm();
      expect(self.rejectConfirm).toBeFalsy();
      self.rejectConfirm = false;
      self.toggleRejectConfirm();
      expect(self.rejectConfirm).toBeTruthy();
    });
  });

  describe("self.accept", function () {
    it("goes to taskerReply state with the current invitation id and 'accepting'", function () {
      spyOn(state, "go");
      self.accept();
      expect(state.go).toHaveBeenCalledWith('taskerReply', jasmine.objectContaining({
        invitation: self.invitationId,
        accepting: 'true'
      }));
    });
  });
});
