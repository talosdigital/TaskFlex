angular.module('tf-client')
.controller('ApplyJobCtrl', function($stateParams, $state, $localStorage, jobService,
                                     offerService, authService, alertService) {
  var self = this;

  if (!authService.authorize(["tasker"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.jobId = $stateParams.id;
  self.job = {};
  self.offer = {
    description: "Hello!\n\nI would like to work with you, please let me know if you are " +
                 "interested.\n\n" + $localStorage.user.firstName + ".",
    metadata: {
      payment: {
        currency: {
          name: "USD"
        }
      }
    }
  };
  self.jobFound = true;

  self.retrieveJob = function() {
    if (!self.jobId) {
      self.alert = alertService.buildError("The job could not be retrieved");
      self.jobFound = false;
      return;
    }
    jobService.getJobById(self.jobId)
      .then(function (data) {
        self.job = data;
        self.offer.jobId = data.id;
        self.offer.metadata = data.metadata;
      }, function (response) {
        self.alert = alertService.buildError("The job could not be retrieved");
        self.jobFound = false;
      });
  };

  self.retrieveJob();

  self.sendApplication = function() {
    offerService.createOffer(self.offer)
      .then(function(data) {
        var alert = alertService.buildSuccess("You've successfully applied to the job");
        $state.go('taskerReply', { alert: alert, offer: data.id });
      }, function(response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your offer couldn't be processed");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("Your offer couldn't be processed");
            break;
        }
      });
  };

  self.cancel = function() {
    $state.go('jobDetails', { job: self.jobId });
  };
});
