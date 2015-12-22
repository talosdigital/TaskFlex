angular.module('tf-client')
.controller('InviteCtrl', function($scope, $state, $stateParams, $filter, $localStorage,
                                   categoryService, jobService, invitationService, locationsService,
                                   taskerService, ownerService, authService, alertService) {
  var self = this;

  if (!authService.authorize(["owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.options = [
    {
      submitted: false,
      jobType: 'choose'
    },
    {
      submitted: false,
      jobType: 'create'
    }
  ];
  self.jobType = 'choose';
  self.jobs = [];
  self.categories = [];
  self.countries = [];
  self.cities = [];
  self.chosenJob = {};
  self.validChosenJob = false;
  self.owner = {
    additionalEmails: []
  };
  self.validCategory = true;
  self.taskerFound = true;
  if ($localStorage.user) {
    self.owner.name = $localStorage.user.firstName;
    self.owner.email = $localStorage.user.email;
  }
  else self.owner.name = 'Job owner';
  self.tasker = {
    id: $stateParams.tasker
  };
  self.today = new Date();
  // These models are different from the variables without 'model' suffix.
  // 'model'-suffixed variables will contain date types.
  self.dueDateModel = angular.copy(self.today);
  self.newJob = {
    startDate: '', // Non-suffixed variables will contain the string representations of
    dueDate: '',   // 'model'-suffixed variables.
    finishDate: '',
    metadata: {
      category: {},
      payment: {
        currency: {
          name: 'USD'
        }
      },
      country: {}
    },
    description: ""
  };
  self.maxLength = 500;
  self.invitation = {
    description: "Hello!\n\nI would like to invite you to work with me. Please read the job " +
                 "information and tell me if you are interested.\n\n" + self.owner.name + "."
  };

  self.retrieveOwnerJobs = function() {
    ownerService.getAllActiveJobs()
      .then(function (data) {
        self.jobs = data.jobs;
      }, function (response) {
        var data = response.data
        self.alert = alertService.buildError('Your current jobs could not be retrieved');
        self.jobs = [];
      });
  };

  self.retrieveOwnerJobs();

  self.retrieveCategories = function() {
    categoryService.getCategories()
      .then(function (data) {
        self.categories = data;
      }, function (response) {
        self.categories = [];
      });
  };

  self.retrieveCategories();

  self.retrieveTaskerInfo = function(taskerId) {
    if (taskerId) {
      taskerService.getTaskerInfo({ id: taskerId })
        .then(function (data) {
          self.tasker = data;
        }, function (response) {
          self.alert = alertService.buildError("The specified tasker was not found");
          self.taskerFound = false;
        });
    }
    else {
      self.alert = alertService.buildError("The specified tasker was not found");
      self.taskerFound = false;
    }
  };

  self.retrieveTaskerInfo(self.tasker.id);

  self.retrieveCountries = function() {
    locationsService.getCountries()
      .then(function (data) {
        self.countries = data;
      }, function (data) {
        self.countries = [];
      });
  };

  self.retrieveCountries();

  self.removeEmail = function(index) {
    self.owner.additionalEmails.splice(index, 1);
  };

  self.sendInvitation = function(validForm) {
    if (!self.validateForm(validForm)) return;
    if (self.jobType == self.options[0].jobType) {
      self.invitation.jobId = self.chosenJob.id;
      self.invitation.providerId = self.tasker.id;
      self.createInvitation(self.invitation);
    }
    else {
      self.newJob.metadata.contact = self.owner;
      self.invitation.providerId = self.tasker.id;
      jobService.createAndInvite(self.newJob, self.invitation)
        .then(function (data) {
          var alert = alertService.buildSuccess("Your invitation has been sent correctly");
          $state.go('myTaskers.findTasker', { alert: alert });
        }, function (response) {
          switch (response.status) {
            case 400:
              self.alert = alertService.buildError(response.data.error,
                                                   "Your invitation could not be sent");
              break;
            case 401:
              $state.go('landing', {});
              break;
            case 404:
              self.alert = alertService.buildError(response.data.error,
                                                   "Your invitation could not be sent");
              break;
            default:
              self.alert = alertService.buildError("Your invitation could not be sent");
          }
        });
    }
  };

  self.validateForm = function(validForm) {
    if (!validForm) return false;
    if (self.jobType == self.options[0].jobType) {
      self.options[0].submitted = true;
      self.validChosenJob = Object.keys(angular.copy(self.chosenJob)).length !== 0;
      validForm &= self.validChosenJob;
    }
    else {
      self.options[1].submitted = true;
      self.validCategory = self.checkCategory();
      validForm &= self.validCategory;
    }
    return validForm;
  };

  self.checkCategory = function() {
    return Object.keys(angular.copy(self.newJob.metadata.category)).length !== 0;
  };

  self.selectCountry = function(country) {
    self.newJob.metadata.country = locationsService.countryInfo(country);
    if (country.callingCodes) {
      self.owner.callingCode = '+' + country.callingCodes[0];
    }
  };

  self.createInvitation = function(attrs) {
    return invitationService.createAndSendInvitation(attrs)
      .then(function (data) {
        var alert = alertService.buildSuccess("Your invitation has been sent correctly");
        $state.go('myTaskers.findTasker', { alert: alert });
      }, function (data) {
        self.alert = alertService.buildError(data.error, "The invitation could not be sent");
      });
  };

  // Functions for dropdown directives.
  self.jobItemClicked = function(job) {
    self.chosenJob = job;
  };

  self.jobItemText = function(job) {
    return job.name;
  };

  self.jobShowCheck = function(job) {
    return self.chosenJob.name == job.name;
  };

  self.categoryItemClicked = function(category) {
    self.newJob.metadata.category = category;
    self.validCategory = self.checkCategory();
  };

  self.categoryItemText = function(category) {
    return category.name;
  };

  self.categoryShowCheck = function(category) {
    return self.newJob.metadata.category.keyword === category.keyword;
  };

  self.countryItemText = function(country) {
    return country.name;
  };

  self.countryShowCheck = function(country) {
    return self.newJob.metadata.country.alpha3Code === country.alpha3Code;
  };
});
