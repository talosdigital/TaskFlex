describe("Category Service", function() {

  var $httpBackend, categoryService, response;

  beforeEach(module('tf-client'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    categoryService = $injector.get('categoryService');
    response = $httpBackend.when('GET').respond(200, []);
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
   });

  describe("getCategories", function() {
    it('calls the $http get method', function() {
      $httpBackend.expectGET();
      categoryService.getCategories();
      $httpBackend.flush();
    });
  });
});
