describe("TaskerInvitationsCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, taskerServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: 'taskerInvitations'
    };
    stateParams = {
      page: 2
    },
    taskerServiceMock = {
      getMyInvitations: function() { return $q.defer().promise },
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
    self = $controller('TaskerInvitationsCtrl', {
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

  describe("self.totalItems", function () {
    it("is 0 by default", function () {
      expect(self.totalItems).toEqual(0);
    });
  });

  describe("self.invitations", function () {
    it("has an empty array as default value", function () {
      expect(self.invitations).toEqual([]);
    });
  });

  describe("self.retrieveInvitations", function () {
    describe("when taskerService.getMyInvitations succeeds", function () {
      it("stores the response invitations in self.invitations", inject(function ($q) {
        var invitationsMock = [
          {
            name: "Invitation 1",
            description: "My description 1"
          },
          {
            name: "Invitation 2",
            description: "My description 2"
          }
        ];
        expect(self.invitations).toEqual([]);
        var response = $q.defer();
        spyOn(taskerServiceMock, "getMyInvitations").and.returnValue(response.promise);
        self.retrieveInvitations();
        response.resolve({ invitations: invitationsMock });
        scope.$digest();
        expect(self.invitations).toEqual(invitationsMock);
      }));

      it("stores the response totalPages self.pages", inject(function ($q) {
        var response = $q.defer();
        spyOn(taskerServiceMock, "getMyInvitations").and.returnValue(response.promise);
        self.retrieveInvitations();
        response.resolve({ invitations: [], totalPages: 5 });
        scope.$digest();
        expect(self.pages).toEqual(5);
      }));

      it("stores the response currentPage self.currentPage", inject(function ($q) {
        var response = $q.defer();
        spyOn(taskerServiceMock, "getMyInvitations").and.returnValue(response.promise);
        self.retrieveInvitations();
        response.resolve({ invitations: [], currentPage: 5 });
        scope.$digest();
        expect(self.currentPage).toEqual(5);
      }));
    });

    describe("when taskerService.getMyInvitations fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyInvitations").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveInvitations();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyInvitations").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveInvitations();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("shows an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyInvitations").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveInvitations();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.viewDetails", function () {
    it("goes to 'invitationDetails' status with the given id as parameter", function () {
      spyOn(state, "go");
      self.viewDetails(20);
      expect(state.go).toHaveBeenCalledWith('invitationDetails', jasmine.objectContaining({
        id: 20
      }));
    });
  });

  describe("self.onPageChange", function () {
    it("calls $state.go with the current state and the given page", function () {
      spyOn(state, "go");
      self.onPageChange(6);
      expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
        page: 6
      }));
    });
  });
});
