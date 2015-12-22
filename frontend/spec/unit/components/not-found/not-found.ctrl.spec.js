describe("NotFoundCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    self = $controller('NotFoundCtrl', {
      $scope: scope,
    });
  }));

  describe("self", function () {
    it("is defined", function () {
      expect(self).toBeDefined();
    });
  });
});
