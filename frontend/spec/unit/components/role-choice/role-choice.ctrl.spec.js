describe("RoleChoiceCtrl", function () {
  beforeEach(module('tf-client'));

  var self, state, authServiceMock;

  beforeEach(inject(function($controller) {
    state = {
      go: function() { },
    };
    authServiceMock = {
      authorize: function() { return true }
    };
    self = $controller('RoleChoiceCtrl', {
      $state: state,
      authService: authServiceMock
    });
  }));

  describe("self.hire", function () {
    it("calls the $state.go method with sign-up state name and role owner", function () {
      spyOn(state, 'go');
      self.hire();
      expect(state.go).toHaveBeenCalledWith('sign-up', jasmine.objectContaining({
        role: "owner"
      }));
    });
  });

  describe("self.work", function () {
    it("calls the $state.go method with sign-up state name and role tasker", function () {
      spyOn(state, 'go');
      self.work();
      expect(state.go).toHaveBeenCalledWith('sign-up', jasmine.objectContaining({
        role: "tasker"
      }));
    });
  });
});
