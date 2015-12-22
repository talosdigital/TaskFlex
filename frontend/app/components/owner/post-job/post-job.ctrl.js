angular.module('tf-client')
.controller('PostJobCtrl', function($stateParams, $state, $cookies, $localStorage, $filter,
                                    categoryService, locationsService, jobService, authService,
                                    alertService) {
  var self = this;

  if ($stateParams.edit) { // If the user is editing a job
    if (!authService.authorize(["owner"], $stateParams)) return;
  }
  else if (!authService.authorize(["", "owner"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.steps = [
    {
      name: "Basic Info",
      key: "basic",
      form: null
    },
    {
      name: "Contact Info",
      key: "contact",
      form: null
    },
    {
      name: "Job Details",
      key: "details",
      form: null
    }
  ];
  self.currentStep = 0;
  self.categories = [];
  self.countries = [];
  self.validCategory = false;
  self.owner = {
    additionalEmails: []
  };
  self.newJob = {
    metadata: {
      category: {},
      payment: {
        currency: {
          name: 'USD'
        }
      },
      country: {}
    }
  };
  self.today = new Date();

  self.setEditing = function(value) {
    if (angular.isDefined(value) && value != false && value != "false") self.editing = value;
    else self.editing = false;
  };

  self.setEditing($stateParams.edit);

  self.retrieveJobToEdit = function(jobId) {
    jobService.getJobById(jobId)
      .then(function (data) {
        self.fillData(data);
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The job to be updated couldn't be retrieved");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("The job to be updated couldn't be retrieved");
        }
      });
  };

  self.fillData = function(jobData) {
    self.newJob = angular.merge(self.newJob, jobData);
    if (angular.isDefined(jobData.metadata) && angular.isDefined(jobData.metadata.contact)) {
      self.owner = angular.merge(self.owner, jobData.metadata.contact);
    }
    self.fillDates();
  };

  self.fillDates = function() {
    if (!(self.newJob.dueDate instanceof Date)) {
      self.newJob.dueDateModel = new Date(self.newJob.dueDate);
    }
    if (!(self.newJob.startDate instanceof Date)) {
      self.newJob.startDateModel = new Date(self.newJob.startDate);
    }
    if (!(self.newJob.finishDate instanceof Date)) {
      self.newJob.finishDateModel = new Date(self.newJob.finishDate);
    }
  };

  if (self.editing) self.retrieveJobToEdit(self.editing);
  else {
    if ($localStorage.user) {
      self.owner.name = $localStorage.user.firstName;
      self.owner.email = $localStorage.user.email;
    }
    else self.owner.name = "Job owner";
    self.newJob.dueDate = angular.copy(self.today);
    if ($stateParams.newJob) self.fillData($stateParams.newJob);
  }

  self.retrieveCategories = function() {
    categoryService.getCategories()
      .then(function (data) {
        self.categories = data;
      }, function (response) {
        self.categories = [];
      });
  };

  self.retrieveCategories();

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
    if (index >= 0 && index < self.owner.additionalEmails.length) {
      self.owner.additionalEmails.splice(index, 1);
    }
  };

  self.goToStep = function(step) {
    if (!self.fieldsCompleted(step)) return;
    if (step == self.steps.length) self.submit(); // Was the last step
    else self.currentStep = step;
  };

  self.submit = function() {
    self.newJob.metadata.contact = self.owner;
    if (self.editing) self.updateJob();
    else {
      if (!$cookies.get('token')) {
        var comeBack = {
          state: $state.current,
          params: {
            newJob: self.newJob,
            edit: 'false'
          }
        };
        $state.go('sign-up', { role: 'owner', comeBack: comeBack, posting: true });
      }
      else self.createJob();
    }
  };

  self.fieldsCompleted = function(until) {
    self.validCategory = self.checkCategory();
    for (var i = 0; i < until && i < self.steps.length; ++i) {
      self.steps[i].form.$submitted = true;
      if (!self.steps[i].form.$valid) {
        self.currentStep = i;
        return false;
      }
    }
    if (!self.validCategory) self.currentStep = 0;
    return self.validCategory;
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

  self.createJob = function() {
    jobService.createJob(self.newJob)
      .then(function (data) {
        var alert = alertService.buildSuccess("Your job was successfully created");
        $state.go($state.current, { alert: alert, reload: true });
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error, "The job couldn't be created");
            break;
          case 401:
            var alert = alertService.buildError("You can't create a job, please log in again");
            var comeBack = {
              state: 'postJob',
              params: {
                newJob: self.newJob
              }
            };
            $state.go('login', { alert: alert, expired: true, comeBack: comeBack });
            break;
          default:
            self.alert = alertService.buildError("The job couldn't be created");
        }
      });
  };

  self.updateJob = function() {
    jobService.updateJob(self.editing, self.newJob)
      .then(function (data) {
        var alert = alertService.buildSuccess("Your job was successfully updated");
        $state.go('jobDetails', { job: self.editing, alert: alert });
      }, function (response) {
        switch (response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "The job couldn't be updated");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("The job couldn't be updated");
        }
      });
  };

  // Functions for dropdown directives.
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
