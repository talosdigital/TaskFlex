describe('ResetPasswordCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, state, userServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { return $q.defer().promise }
    };
    userServiceMock = {
      resetPassword: function() { return $q.defer().promise }
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
    self = $controller('ResetPasswordCtrl', {
      $scope: scope,
      $state: state,
      userService: userServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe('self.submitted', function() {
    it('is set to false initially', function() {
      expect(self.submitted).toBeFalsy();
    });
  });

  describe('self.password', function() {
    it('is set to empty initially', function() {
      expect(self.password).toEqual('');
    });
  });

  describe("self.inputType", function () {
    it("is set to 'password' intially", function () {
      expect(self.inputType).toEqual('password');
    });
  });

  describe('self.submit', function() {
    describe('when the form is not valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(false);
        expect(self.submitted).toBeTruthy();
      });

      it('doesn\'t call the userService\'s resetPassword method', function() {
        spyOn(userServiceMock, 'resetPassword');
        self.submit(false);
        expect(userServiceMock.resetPassword).not.toHaveBeenCalled();
      });
    });

    describe('when the form is valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(true);
        expect(self.submitted).toBeTruthy();
      });

      it('calls userService\'s resetPassword method', inject(function($q) {
        self.password = "abcABC123";
        self.token = "abc-def-ghi";
        var response = $q.defer();
        spyOn(userServiceMock, 'resetPassword').and.returnValue(response.promise);
        self.submit(true);
        expect(userServiceMock.resetPassword).toHaveBeenCalledWith("abcABC123", "abc-def-ghi");
      }));

      describe('when userService.resetPassword method succeeds', function() {
        it('goes to login state with a success alert as parameter', inject(function($q) {
          var response = $q.defer();
          spyOn(userServiceMock, 'resetPassword').and.returnValue(response.promise);
          spyOn(state, "go");
          self.submit(true);
          response.resolve();
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('login', jasmine.objectContaining({
            alert: jasmine.objectContaining({
              error: false
            })
          }));
        }));
      });

      describe('when userService.resetPassword method fails', function() {
        describe("when server responds with 400", function () {
          it('builds a failure alert', inject(function($q) {
            expect(self.alert).toBeUndefined();
            var response = $q.defer();
            spyOn(userServiceMock, 'resetPassword').and.returnValue(response.promise);
            spyOn(alertServiceMock, "buildError");
            self.submit(true);
            response.reject({ status: 400, data: {} });
            scope.$digest();
            expect(alertServiceMock.buildError).toHaveBeenCalled();
          }));
        });

        describe("when server doesn't respond with 400", function () {
          it('shows a failure alert', inject(function($q) {
            expect(self.alert).toBeUndefined();
            var response = $q.defer();
            spyOn(userServiceMock, 'resetPassword').and.returnValue(response.promise);
            spyOn(alertServiceMock, "buildError");
            self.submit(true);
            response.reject({ status: 500, data: {} });
            scope.$digest();
            expect(alertServiceMock.buildError).toHaveBeenCalled();
          }));
        });
      });
    });
  });

  describe("self.toggleVisibility", function () {
    describe("when self.inputType is set to 'password'", function () {
      it("sets the self.inputType to 'text'", function () {
        self.inputType = 'password';
        self.toggleVisibility();
        expect(self.inputType).toEqual('text');
      });
    });

    describe("when self.inputType is set to 'text'", function () {
      it("sets the self.inputType to 'password'", function () {
        self.inputType = 'text';
        self.toggleVisibility();
        expect(self.inputType).toEqual('password');
      });
    });
  });
});
