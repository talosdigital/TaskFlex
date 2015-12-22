describe('RequestPasswordCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, userServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    userServiceMock = {
      requestResetPassword: function() { return $q.defer().promise }
    };
    authServiceMock = {
      authorize: function() { return true }
    };
    alertServiceMock = {
      buildSuccess: function() { },
      buildError: function() { }
    };
    self = $controller('RequestPasswordCtrl', {
      $scope: scope,
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

  describe('self.email', function() {
    it('is set to empty initially', function() {
      expect(self.email).toEqual('');
    });
  });

  describe('self.submit', function() {
    describe('when the form is not valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(false);
        expect(self.submitted).toBeTruthy();
      });

      it('doesn\'t call the userService\'s requestResetPassword method', function() {
        spyOn(userServiceMock, 'requestResetPassword');
        self.submit(false);
        expect(userServiceMock.requestResetPassword).not.toHaveBeenCalled();
      });
    });

    describe('when the form is valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(true);
        expect(self.submitted).toBeTruthy();
      });

      it('calls userService\'s requestResetPassword method', inject(function($q) {
        self.email = "hola@hola.com";
        var response = $q.defer();
        spyOn(userServiceMock, 'requestResetPassword').and.returnValue(response.promise);
        self.submit(true);
        expect(userServiceMock.requestResetPassword).toHaveBeenCalledWith("hola@hola.com");
      }));

      describe('when userService.requestResetPassword method succeeds', function() {
        it('builds a success alert', inject(function($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(userServiceMock, 'requestResetPassword').and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildSuccess");
          self.submit(true);
          response.resolve();
          scope.$digest();
          expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        }));

        it("sets the self.email to empty and self.submitted to false", inject(function ($q) {
          self.email = "hola@hola.com";
          var response = $q.defer();
          spyOn(userServiceMock, 'requestResetPassword').and.returnValue(response.promise);
          self.submit(true);
          response.resolve();
          scope.$digest();
          expect(userServiceMock.requestResetPassword).toHaveBeenCalledWith("hola@hola.com");
          expect(self.email).toEqual("");
          expect(self.submitted).toBeFalsy();
        }));
      });

      describe('when userService.requestResetPassword method fails', function() {
        describe("when server responds with 400", function () {
          it('builds a failure alert', inject(function($q) {
            expect(self.alert).toBeUndefined();
            var response = $q.defer();
            spyOn(userServiceMock, 'requestResetPassword').and.returnValue(response.promise);
            spyOn(alertServiceMock, "buildError");
            self.submit(true);
            response.reject({ status: 400, data: {} });
            scope.$digest();
            expect(alertServiceMock.buildError).toHaveBeenCalled();
          }));
        });

        describe("when server doesn't respond with 400", function () {
          it('builds an error alert', inject(function($q) {
            expect(self.alert).toBeUndefined();
            var response = $q.defer();
            spyOn(userServiceMock, 'requestResetPassword').and.returnValue(response.promise);
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
});
