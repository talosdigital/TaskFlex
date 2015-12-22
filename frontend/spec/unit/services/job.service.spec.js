describe("Job Service", function() {

  var $httpBackend, jobService, response;

  beforeEach(module('tf-client'));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    jobService = $injector.get('jobService');
    response = $httpBackend.when('GET').respond(200, []);
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
   });

  describe("getAvailableJobs", function() {
    var filter = {};
    it('calls the $http get method', function() {
      $httpBackend.expectGET();
      jobService.getAvailableJobs(filter);
      $httpBackend.flush();
    });
  });
});
