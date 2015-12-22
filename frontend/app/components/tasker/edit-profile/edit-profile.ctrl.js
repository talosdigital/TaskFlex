angular.module('tf-client')
.controller('EditProfileCtrl', function($state, $stateParams, $filter, $window, $interval,
                                        taskerService, locationsService, authService,
                                        alertService) {
  var self = this;

  if (!authService.authorize(["tasker"], $stateParams)) return;

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
      name: "Personal Info",
      key: "personal",
      form: null
    },
    {
      name: "Previous Jobs",
      key: "previous",
      form: null
    }
  ];
  self.currentStep = 0;
  self.countries = [];
  self.today = new Date();
  self.tasker = {
    gender: '',
    metadata: {
      previousJobs: [
        {
          // These models are different from the variables without 'model' suffix.
          // 'model'-suffixed variables will contain date types.
          startDateModel: angular.copy(self.today),
          finishDateModel: angular.copy(self.today),
          // Non-suffixed variables will contain the string representations of
          // 'model'-suffixed variables.
          startDate: '',
          finishDate: ''
        }
      ],
      fee: {
        currency: {
          name: "USD"
        }
      },
      country: {}
    }
  };
  self.genders = [
    "male",
    "female"
  ];
  self.taskerId;
  self.availabilities = [
    "All days, the whole day",
    "Weekdays, the whole day",
    "Weekends, the whole day",
    "All days at morning",
    "All days at afternoon",
    "All days at night",
    "Weekdays at morning",
    "Weekdays at afternoon",
    "Weekdays at night",
    "Weekends at morning",
    "Weekends at afternoon",
    "Weekends at night"
  ];
  self.hideAlert;
  self.currentPrevJob = 0;

  self.retrieveTasker = function() {
    taskerService.getMyInfo()
      .then(function(data) {
        self.fillTasker(data);
      }, function(response) {
        switch(response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your information could not be retrieved");
            break;
          case 401:
            $state.go("landing");
            break;
          default:
            self.alert = alertService.buildError("Your information could not be retrieved");
            break;
        }
      });
  };

  self.retrieveTasker();

  self.fillTasker = function(taskerData) {
    self.tasker = angular.merge(self.tasker, taskerData);
    self.taskerId = self.tasker.id;
    self.deleteUnusedKeys();
    self.fillPrevJobs();
  };

  self.deleteUnusedKeys = function() {
    delete self.tasker.addresses;
    delete self.tasker.birthDate;
    delete self.tasker.contacts;
    delete self.tasker.createdAt;
    delete self.tasker.updateAt;
    delete self.tasker.id;
  };

  self.goToStep = function(step) {
    if (!self.fieldsCompleted(step)) return;
    if (step == self.steps.length) self.submit(); // Was the last step
    else self.currentStep = step;
  };

  self.savedAlertContent = function() {
    return {
      message: "Your profile was successfully updated",
      error: false
    };
  };

  // TODO: Move this timer logic to the alert service.
  self.showSavedAlert = function() {
    // If previous timer was setted, stop and unset it.
    if (angular.isDefined(self.hideAlert)) {
      $interval.cancel(self.hideAlert);
      self.hideAlert = undefined;
    }
    self.alert = self.savedAlertContent();
    // Hide the alert in 5 seconds.
    self.hideAlert = $interval(function() {
      self.alert = undefined
    }, 5000, 5);
  };

  self.submit = function(submittedFrom) {
    if (submittedFrom != undefined && !self.fieldsCompleted(submittedFrom + 1)) return;
    if (self.tasker.metadata) delete self.tasker.metadata.picture;
    taskerService.updateMyInfo(self.tasker)
      .then(function(data) {
        if (submittedFrom == undefined || submittedFrom == self.steps.length - 1) {
          var alert = self.savedAlertContent();
          $state.go('taskerProfile', { alert: alert, id: self.taskerId });
        }
        else self.showSavedAlert();
      }, function(response) {
        switch(response.status) {
          case 400:
            self.alert = alertService.buildError(response.data.error,
                                                 "Your profile could not be updated");
            break;
          case 401:
            $state.go('landing', {});
            break;
          default:
            self.alert = alertService.buildError("Your profile could not be updated");
            break;
        }
      });
  };

  self.fieldsCompleted = function(until) {
    for (var i = 0; i < until && i < self.steps.length; ++i) {
      self.steps[i].form.$submitted = true;
      if (!self.steps[i].form.$valid) {
        self.currentStep = i;
        return false;
      }
    }
    return true;
  };

  self.retrieveCountries = function() {
    locationsService.getCountries()
      .then(function (data) {
        self.countries = data;
      }, function (data) {
        self.countries = [];
      });
  };

  self.retrieveCountries();

  self.fillPrevJobs = function() {
    for (var i = 0; i < self.tasker.metadata.previousJobs.length; ++i) {
      var startDate = self.tasker.metadata.previousJobs[i].startDate;
      var finishDate = self.tasker.metadata.previousJobs[i].finishDate;
      if (!(startDate instanceof Date)) {
        startDate = new Date(startDate);
      }
      if (!(finishDate instanceof Date)) {
        finishDate = new Date(finishDate);
      }
      self.tasker.metadata.previousJobs[i].startDateModel = startDate;
      self.tasker.metadata.previousJobs[i].finishDateModel = finishDate;
    }
  };

  self.selectCountry = function(country) {
    self.tasker.metadata.country = locationsService.countryInfo(country);
    if (country.callingCodes) {
      self.tasker.metadata.callingCode = '+' + country.callingCodes[0];
    }
  };

  self.expandExperience = function(index) {
    if (self.currentPrevJob == index) self.currentPrevJob = -1;
    else self.currentPrevJob = index;
  };

  self.validExperience = function(ind) {
    return self.steps[3].form['company' + ind].$valid && self.steps[3].form['title' + ind].$valid &&
           self.steps[3].form['start' + ind].$valid && self.steps[3].form['finish' + ind].$valid;
  };

  self.addExperience = function() {
    var allValid = true;
    for (var i = 0; allValid && i < self.tasker.metadata.previousJobs.length; ++i) {
      if (!self.validExperience(i)) {
        self.currentPrevJob = i;
        allValid = false;
      }
    }
    if (allValid) {
      self.tasker.metadata.previousJobs.push({});
      self.currentPrevJob = self.tasker.metadata.previousJobs.length - 1;
    }
    else self.steps[3].form.$submitted = true;
  };

  self.removeExperience = function(index) {
    if (index >= 0 && index < self.tasker.metadata.previousJobs.length) {
      self.tasker.metadata.previousJobs.splice(index, 1);
    }
  };

  self.changePicture = function() {
    $window.open('http://en.gravatar.com', '_blank');
  };

  // Dropdown directives functions
  self.genderItemClicked = function(gender) {
    self.tasker.gender = gender;
  };

  self.genderItemText = function(gender) {
    return $filter('capitalize')(gender);
  };

  self.genderShowCheck = function(gender) {
    return self.tasker.gender === gender;
  };

  self.countryItemText = function(country) {
    return country.name;
  };

  self.countryShowCheck = function(country) {
    return self.tasker.metadata.country.alpha3Code === country.alpha3Code;
  };

  self.availabilityItemClicked = function(availability) {
    self.tasker.metadata.availability = availability;
  };

  self.availabilityItemText = function(availability) {
    return availability;
  };

  self.availabilityShowCheck = function(availability) {
    return self.tasker.metadata.availability == availability;
  };
});
