describe("LandingCtrl", function () {
  beforeEach(module('tf-client'));

  var self, localStorage;

  beforeEach(inject(function($controller) {
    localStorage = {};
    self = $controller('LandingCtrl', {
      $localStorage: localStorage
    });
  }));

  describe("self.isTasker", function () {
    describe("when localStorage has a tasker user", function () {
      it("returns true", function () {
        localStorage.user = {
          roles: ["tasker"]
        };
        expect(self.isTasker()).toBeTruthy();
      });
    });

    describe("when localStorage has an owner user", function () {
      it("returns false", function () {
        localStorage.user = {
          roles: ["owner"]
        };
        expect(self.isTasker()).toBeFalsy();
      });
    });

    describe("when localStorage has no user", function () {
      it("returns false", function () {
        expect(self.isTasker()).toBeFalsy();
      });
    });
  });
});
