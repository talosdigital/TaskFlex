describe('ChangePasswordCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, state, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    state = {
      go: function() { }
    };
    authServiceMock = {
      authorize: function() { return true }
    };
    alertServiceMock = {
      buildSuccess: function() { },
      buildError: function() { }
    };
    self = $controller('ChangePasswordCtrl', {
      $scope: scope,
      $state: state,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe('self.submitted', function() {
    it('is set to false initially', function() {
      expect(self.submitted).toBeFalsy();
    });
  });

  describe('self.currentInputType', function() {
    it('is set to "password" initially', function() {
      expect(self.currentInputType).toEqual('password');
    });
  });

  describe('self.newInputType', function() {
    it('is set to "password" initially', function() {
      expect(self.newInputType).toEqual('password');
    });
  });

  describe('self.user', function() {
    it('is set to an empty object intially', function() {
      expect(self.user).toEqual({});
    });
  });

  describe('self.submit', function() {
    describe('when the form is not valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(false);
        expect(self.submitted).toBeTruthy();
      });

      it('doesn\'t call the userService\'s changePassword method', inject(function(userService) {
        spyOn(userService, 'changePassword');
        self.submit(false);
        expect(userService.changePassword).not.toHaveBeenCalled();
      }));
    });

    describe('when the form is valid', function() {
      it('sets self.submitted to true', function() {
        expect(self.submitted).toBeFalsy();
        self.submit(true);
        expect(self.submitted).toBeTruthy();
      });

      it('calls userService\'s changePassword method', inject(function($q, userService) {
        var response = $q.defer();
        spyOn(userService, 'changePassword').and.returnValue(response.promise);
        self.submit(true);
        expect(userService.changePassword).toHaveBeenCalled();
      }));

      describe('when userService.changePassword method succeeds', function() {
        it('builds a success alert', inject(function($q, userService) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(userService, 'changePassword').and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildSuccess");
          self.submit(true);
          response.resolve();
          scope.$digest();
          expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        }));
      });

      describe('when userService.changePassword method fails', function() {
        describe("when the response status is 400", function () {
          it('builds a failure alert', inject(function($q, userService) {
            expect(self.alert).toBeUndefined();
            var response = $q.defer();
            spyOn(userService, 'changePassword').and.returnValue(response.promise);
            spyOn(alertServiceMock, "buildError");
            self.submit(true);
            response.reject({ status: 400, data: {} });
            scope.$digest();
            expect(alertServiceMock.buildError).toHaveBeenCalled();
          }));
        });

        describe("when the response status is 401", function () {
          it('goes to landing state', inject(function($q, userService) {
            expect(self.alert).toBeUndefined();
            var response = $q.defer();
            spyOn(userService, 'changePassword').and.returnValue(response.promise);
            spyOn(state, "go");
            self.submit(true);
            response.reject({ status: 401, data: {} });
            scope.$digest();
            expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
          }));
        });

        describe("when the response status is neither 400 nor 401", function () {
          it('builds a failure alert', inject(function($q, userService) {
            expect(self.alert).toBeUndefined();
            var response = $q.defer();
            spyOn(userService, 'changePassword').and.returnValue(response.promise);
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

  describe('self.toggleCurrentVisibility', function() {
    it('sets the self.currentInputType to "text" if it is "password"', function() {
      self.currentInputType = 'password';
      self.toggleCurrentVisibility();
      expect(self.currentInputType).toEqual('text');
    });
  });

  describe('self.toggleCurrentVisibility', function() {
    it('sets the self.currentInputType to "password" if it is "text"', function() {
      self.currentInputType = 'text';
      self.toggleCurrentVisibility();
      expect(self.currentInputType).toEqual('password');
    });
  });

  describe('self.toggleNewVisibility', function() {
    it('sets the self.newInputType to "text" if it is "password"', function() {
      self.newInputType = 'password';
      self.toggleNewVisibility();
      expect(self.newInputType).toEqual('text');
    });
  });

  describe('self.toggleNewVisibility', function() {
    it('sets the self.newInputType to "password" if it is "text"', function() {
      self.newInputType = 'text';
      self.toggleNewVisibility();
      expect(self.newInputType).toEqual('password');
    });
  });
});
