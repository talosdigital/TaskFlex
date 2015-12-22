describe("EditProfileCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, filter, windowMock, taskerServiceMock, locationsServiceMock,
      authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { }
    };
    stateParams = { };
    filter = function () { return function() { } };
    windowMock = {
      open: function() { }
    };
    taskerServiceMock = {
      getMyInfo: function() { return $q.defer().promise; },
      updateMyInfo: function() { return $q.defer().promise; }
    };
    locationsServiceMock = {
      getCountries: function() { return $q.defer().promise; },
      countryInfo: function() { return $q.defer().promise; }
    };
    authServiceMock = {
      authorize: function() { return true }
    };
    alertServiceMock = {
      buildSuccess: function() { 
        return {
          error: false
        };
      },
      buildError: function() {
        return {
          error: false
        };
      }
    };
    self = $controller('EditProfileCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      $filter: filter,
      $window: windowMock,
      taskerService: taskerServiceMock,
      locationsService: locationsServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.steps", function () {
    it("has four default options", function () {
      expect(self.steps.length).toEqual(4);
      expect(self.steps[0]).toEqual(jasmine.objectContaining({
        name: "Basic Info",
        key: "basic"
      }));
      expect(self.steps[1]).toEqual(jasmine.objectContaining({
        name: "Contact Info",
        key: "contact"
      }));
      expect(self.steps[2]).toEqual(jasmine.objectContaining({
        name: "Personal Info",
        key: "personal"
      }));
      expect(self.steps[3]).toEqual(jasmine.objectContaining({
        name: "Previous Jobs",
        key: "previous"
      }));
    });
  });

  describe("self.currentStep", function () {
    it("is set to 0 by default", function () {
      expect(self.currentStep).toEqual(0);
    });
  });

  describe("self.countries", function () {
    it("is an empty array by default", function () {
      expect(self.countries).toEqual([]);
    });
  });

  describe("self.today", function () {
    it("is defined by default", function () {
      expect(self.today).toBeDefined();
    });
  });

  describe("self.tasker", function () {
    it("is defined with some default information", function () {
      expect(self.tasker).toBeDefined();
      expect(self.tasker.metadata).toBeDefined();
      expect(self.tasker.metadata.previousJobs).toBeDefined();
      expect(self.tasker.metadata.fee).toBeDefined();
      expect(self.tasker.metadata.previousJobs).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({
          startDateModel: self.today,
          finishDateModel: self.today,
          startDate: '',
          finishDate: ''
        })
      ]));
      expect(self.tasker.metadata.fee.currency).toBeDefined();
      expect(self.tasker.metadata.fee.currency.name).toEqual("USD");
    });
  });

  describe("self.availabilities", function () {
    it("has some default values", function () {
      expect(self.availabilities).toEqual(jasmine.arrayContaining([
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
      ]));
    });
  });

  describe("self.hideAlert", function () {
    it("is undefined by default", function () {
      expect(self.hideAlert).toBeUndefined();
    });
  });

  describe("self.currentPrevJob", function () {
    it("is set to 0 by default", function () {
      expect(self.currentPrevJob).toEqual(0);
    });
  });

  describe("self.retrieveTasker", function () {
    it("calls taskerService.getMyInfo", inject(function ($q) {
      spyOn(taskerServiceMock, "getMyInfo").and.returnValue($q.defer().promise);
      self.retrieveTasker();
      expect(taskerServiceMock.getMyInfo).toHaveBeenCalled();
    }));

    describe("when taskerService.getMyInfo succeeds", function () {
      it("calls self.fillTasker with the retrieved data", inject(function ($q) {
        var taskerMock = {
          firstName: "Santiago",
          lastName: "Vanegas",
        };
        var response = $q.defer();
        spyOn(taskerServiceMock, "getMyInfo").and.returnValue(response.promise);
        spyOn(self, "fillTasker");
        self.retrieveTasker();
        response.resolve(taskerMock);
        scope.$digest();
        expect(taskerServiceMock.getMyInfo).toHaveBeenCalled();
        expect(self.fillTasker).toHaveBeenCalledWith(taskerMock);
      }));
    });

    describe("when taskerService.getMyInfo fails", function () {
      describe("when the response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyInfo").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveTasker();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(taskerServiceMock.getMyInfo).toHaveBeenCalled();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when the response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyInfo").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveTasker();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(taskerServiceMock.getMyInfo).toHaveBeenCalled();
          expect(state.go).toHaveBeenCalledWith('landing');
        }));
      });

      describe("when the response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "getMyInfo").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveTasker();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(taskerServiceMock.getMyInfo).toHaveBeenCalled();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.fillTasker", function () {
    it("calls deleteUnusedKeys and fillPrevJobs", function () {
      spyOn(self, "deleteUnusedKeys");
      spyOn(self, "fillPrevJobs");
      self.fillTasker({});
      expect(self.deleteUnusedKeys).toHaveBeenCalled();
      expect(self.fillPrevJobs).toHaveBeenCalled();
    });
  });

  describe("self.deleteUnusedKeys", function () {
    it("deletes some specific fields from self.tasker", function () {
      self.tasker.addresses = ["hi"];
      self.tasker.birthDate = new Date();
      self.tasker.contacts = ["morning"];
      self.tasker.createdAt = "2010-01-01";
      self.tasker.updateAt = "2015-01-01";
      self.tasker.id = "abc";
      self.deleteUnusedKeys();
      expect(self.tasker.addresses).toBeUndefined;
      expect(self.tasker.birthDate).toBeUndefined;
      expect(self.tasker.contacts).toBeUndefined;
      expect(self.tasker.createdAt).toBeUndefined;
      expect(self.tasker.updateAt).toBeUndefined;
      expect(self.tasker.id).toBeUndefined;
    });
  });

  describe("self.goToStep", function () {
    describe("when the given step is the last + 1", function () {
      describe("when self.fieldsCompleted returns true", function () {
        it("calls self.submit method", function () {
          self.steps = [{}, {}, {}];
          spyOn(self, "submit");
          spyOn(self, "fieldsCompleted").and.returnValue(true);
          self.goToStep(3);
          expect(self.submit).toHaveBeenCalled();
        });
      });

      describe("when self.fieldsCompleted returns false", function () {
        it("doesn't call self.submit method", function () {
          self.steps = [{}, {}, {}];
          spyOn(self, "submit");
          spyOn(self, "fieldsCompleted").and.returnValue(false);
          self.goToStep(3);
          expect(self.submit).not.toHaveBeenCalled();
        });
      });
    });

    describe("when the given step is not the last + 1", function () {
      describe("when self.fieldsCompleted returns true", function () {
        it("sets the given step to self.currentStep", function () {
          self.currentStep = 0;
          self.steps = [{}, {}, {}];
          spyOn(self, "submit");
          spyOn(self, "fieldsCompleted").and.returnValue(true);
          self.goToStep(1);
          expect(self.submit).not.toHaveBeenCalled();
          expect(self.currentStep).toEqual(1);
        });
      });

      describe("when self.fieldsCompleted returns false", function () {
        it("doesn't change the currentStep", function () {
          self.currentStep = 0;
          self.steps = [{}, {}, {}];
          spyOn(self, "submit");
          spyOn(self, "fieldsCompleted").and.returnValue(false);
          self.goToStep(2);
          expect(self.submit).not.toHaveBeenCalled();
          expect(self.currentStep).toEqual(0);
        });
      });
    });
  });

  describe("self.submit", function () {
    describe("when taskerService.updateMyInfo succeeds", function () {
      describe("when submittedFrom is undefined", function () {
        it("goes to taskerProfile state with an alert", inject(function ($q) {
          var response = $q.defer();
          self.taskerId = "my-tasker-id";
          spyOn(self, "fieldsCompleted").and.returnValue(true);
          spyOn(taskerServiceMock, "updateMyInfo").and.returnValue(response.promise);
          spyOn(self, "fillPrevJobs");
          spyOn(state, "go");
          self.submit();
          response.resolve({});
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('taskerProfile', jasmine.objectContaining({
            id: 'my-tasker-id'
          }));
        }));
      });

      describe("when submittedFrom is the last step", function () {
        it("goes to taskerProfile state with an alert", inject(function ($q) {
          self.steps = [
            { },
            { },
            { }
          ];
          var response = $q.defer();
          self.taskerId = "my-tasker-id";
          spyOn(self, "fieldsCompleted").and.returnValue(true);
          spyOn(taskerServiceMock, "updateMyInfo").and.returnValue(response.promise);
          spyOn(self, "fillPrevJobs");
          spyOn(state, "go");
          self.submit(self.steps.length - 1);
          response.resolve({});
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('taskerProfile', jasmine.objectContaining({
            id: 'my-tasker-id'
          }));
        }));
      });

      describe("when submittedForm is defined but not the last step", function () {
        it("shows an alert with no error", inject(function ($q) {
          self.steps = [
            { },
            { },
            { }
          ];
          var response = $q.defer();
          self.taskerId = "my-tasker-id";
          spyOn(self, "fieldsCompleted").and.returnValue(true);
          spyOn(taskerServiceMock, "updateMyInfo").and.returnValue(response.promise);
          spyOn(self, "fillPrevJobs");
          spyOn(state, "go");
          spyOn(self, "showSavedAlert");
          self.submit(1);
          response.resolve({});
          scope.$digest();
          expect(self.showSavedAlert).toHaveBeenCalled();
        }));
      });
    });

    describe("when taskerService.updateMyInfo fails", function () {
      describe("when response.status is 400", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateMyInfo").and.returnValue(response.promise);
          spyOn(self, "fillPrevJobs");
          spyOn(alertServiceMock, "buildError");
          self.submit();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when response.status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateMyInfo").and.returnValue(response.promise);
          spyOn(self, "fillPrevJobs");
          spyOn(state, "go");
          self.submit();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when response.status is neither 400 nor 401", function () {
        it("builds an error alert", inject(function ($q) {
          expect(self.alert).toBeUndefined();
          var response = $q.defer();
          spyOn(taskerServiceMock, "updateMyInfo").and.returnValue(response.promise);
          spyOn(self, "fillPrevJobs");
          spyOn(alertServiceMock, "buildError");
          self.submit();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.fieldsCompleted", function () {
    describe("when all forms are valid", function () {
      it("returns true", function () {
        self.steps = [
          {
            form: {
              $valid: true
            }
          },
          {
            form: {
              $valid: true
            }
          },
          {
            form: {
              $valid: true
            }
          }
        ];
        spyOn(self, "goToStep");
        expect(self.fieldsCompleted()).toBeTruthy();
      });
    });

    describe("when there is some step not valid", function () {
      it("sets the invalid step to self.currentStep", function () {
        self.steps = [
          {
            form: {
              $valid: true
            }
          },
          {
            form: {
              $valid: false
            }
          },
          {
            form: {
              $valid: false
            }
          }
        ];
        self.currentStep = 0;
        spyOn(self, "goToStep");
        self.fieldsCompleted(2);
        expect(self.currentStep).toEqual(1);
      });

      it("it returns false", function () {
        self.steps = [
          {
            form: {
              $valid: false
            }
          }
        ];
        spyOn(self, "goToStep");
        expect(self.fieldsCompleted(2)).toBeFalsy();;
      });
    });
  });

  describe("self.retrieveCountries", function () {
    describe("when locationsService.getCountries succeeds", function () {
      it("sets the response to self.countries", inject(function ($q) {
        expect(self.countries).toEqual([]);
        var countriesMock = [
          {
            name: "Colombia",
            code: "CO"
          },
          {
            name: "United States",
            code: "US"
          }
        ];
        var response = $q.defer();
        spyOn(locationsServiceMock, "getCountries").and.returnValue(response.promise);
        self.retrieveCountries();
        response.resolve(countriesMock);
        scope.$digest();
        expect(self.countries).toEqual(countriesMock);
      }));
    });

    describe("when locationsService.getCountries fails", function () {
      it("sets self.countries to empty", inject(function ($q) {
        var response = $q.defer();
        spyOn(locationsServiceMock, "getCountries").and.returnValue(response.promise);
        self.retrieveCountries();
        response.reject({ status: 400, data: {} });
        scope.$digest();
        expect(self.countries).toEqual([]);
      }));
    });
  });

  describe("self.fillPrevJobs", function () {
    describe("when some start date or finishDate is not of type Date", function () {
      it("converts it to date", function () {
        self.tasker = {
          metadata: {
            previousJobs: [
              {
                startDate: "2015-01-01",
                finishDate: "2016-01-01"
              }
            ]
          }
        };
        self.fillPrevJobs();
        expect(self.tasker.metadata.previousJobs[0].startDateModel).toEqual(jasmine.any(Date));
        expect(self.tasker.metadata.previousJobs[0].finishDateModel).toEqual(jasmine.any(Date));
      });
    });
  });

  describe("self.selectCountry", function () {
    it("sets the given country to self.tasker.metadata.country", function () {
      self.tasker = {
        metadata: {
          country: undefined
        }
      };
      var countryMock = {
        name: "Colombia",
        alpha3Code: "ABC"
      }
      spyOn(locationsServiceMock, "countryInfo").and.returnValue(countryMock);
      self.selectCountry({ name: "Colombia" });
      expect(self.tasker.metadata.country).toEqual(countryMock);
    });

    describe("when given country callingCodes attribute is defined", function () {
      it("sets the first calling code to self.tasker.metadata.callingCode", function () {
        self.tasker = { metadata: {} };
        self.selectCountry({ callingCodes: ["57"] });
        expect(self.tasker.metadata.callingCode).toEqual("+57");
      });
    });
  });

  describe("self.expandExperience", function () {
    describe("when the given index is the same as self.currentPrevJob", function () {
      it("sets self.currentPrevJob to -1", function () {
        self.currentPrevJob = 2;
        self.expandExperience(2);
        expect(self.currentPrevJob).toEqual(-1);
      });
    });

    describe("when the given index is no the same as self.currentPrevJob", function () {
      it("sets the given index to self.currentPrevJob", function () {
        self.currentPrevJob = 2;
        self.expandExperience(3);
        expect(self.currentPrevJob).toEqual(3);
      });
    });
  });

  describe("self.addExperience", function () {
    it("validates all current previous jobs using self.validExperience method", function () {
      self.tasker.metadata.previousJobs = [{}, {}, {}];
      spyOn(self, "validExperience").and.returnValue(true);
      self.addExperience();
      expect(self.validExperience).toHaveBeenCalledWith(0);
      expect(self.validExperience).toHaveBeenCalledWith(1);
      expect(self.validExperience).toHaveBeenCalledWith(2);
    });

    describe("when all previous jobs so far are valid", function () {
      it("adds an object to self.tasker.metadata.previousJobs", function () {
        self.tasker.metadata.previousJobs = [{}, {}, {}];
        spyOn(self, "validExperience").and.returnValue(true);
        self.addExperience();
        expect(self.tasker.metadata.previousJobs.length).toEqual(4);
      });
    });

    describe("when some previous job is invalid", function () {
      it("doesn't add another previous job", function () {
        self.tasker.metadata.previousJobs = [{}, {}, {}];
        spyOn(self, "validExperience").and.returnValue(false);
        self.steps[3].form = {
          $submitted: false
        };
        self.addExperience();
        expect(self.tasker.metadata.previousJobs.length).toEqual(3);
      });
    });
  });

  describe("self.removeExperience", function () {
    it("removes one array element from self.tasker.metadata.previousJobs", function () {
      self.tasker = {
        metadata: {
          previousJobs: [{ name: "job1" }, { name: "job2" }, { name: "job3" }]
        }
      };
      self.removeExperience(1);
      expect(self.tasker.metadata.previousJobs).toEqual([{ name: "job1" }, { name: "job3" }]);
    });
  });

  describe("self.changePicture", function () {
    it("calls $window.open", function () {
      spyOn(windowMock, "open");
      self.changePicture();
      expect(windowMock.open).toHaveBeenCalled();
    });
  });

  describe("self.genderItemClicked", function () {
    it("sets the given gender to self.tasker.gender", function () {
      self.tasker = { };
      self.genderItemClicked("male");
      expect(self.tasker.gender).toEqual("male");
    });
  });

  describe("self.genderShowCheck", function () {
    describe("when given gender and self.tasker.gender are the same", function () {
      it("returns true", function () {
        self.tasker = {
          gender: "male"
        };
        expect(self.genderShowCheck('male')).toBeTruthy();
      });
    });

    describe("when given gender and self.tasker.gender are not the same", function () {
      it("returns true", function () {
        self.tasker = {
          gender: "male"
        };
        expect(self.genderShowCheck('female')).toBeFalsy();
      });
    });
  });

  describe("self.countryItemText", function () {
    it("returns the given country name", function () {
      expect(self.countryItemText({ name: "my-country" })).toEqual("my-country");
    });
  });

  describe("self.countryShowCheck", function () {
    describe("when the given country name and self.tasker's codes are the same", function () {
      it("returns true", function () {
        self.tasker = {
          metadata: {
            country: {
              alpha3Code: "ABC"
            }
          }
        };
        expect(self.countryShowCheck({ alpha3Code: 'ABC' })).toBeTruthy();
      });
    });

    describe("when the given country name and self.tasker's are not the same", function () {
      it("returns true", function () {
        self.tasker = {
          metadata: {
            country: {
              alpha3Code: "ABC"
            }
          }
        };
        expect(self.countryShowCheck({ alpha3Code: 'DEF' })).toBeFalsy();
      });
    });
  });

  describe("self.availabilityItemClicked", function () {
    it("sets the given availability to self.tasker.metadata.availability", function () {
      self.tasker = {
        metadata: {}
      };
      self.availabilityItemClicked("my-availability");
      expect(self.tasker.metadata.availability).toEqual("my-availability");
    });
  });

  describe("self.availabilityItemText", function () {
    it("returns the given availability", function () {
      expect(self.availabilityItemText("availability-1")).toEqual("availability-1");
    });
  });

  describe("self.availabilityShowCheck", function () {
    describe("when the given availability and self.tasker.metadata are the same", function () {
      it("returns true", function () {
        self.tasker = {
          metadata: {
            availability: "my-availability"
          }
        };
        expect(self.availabilityShowCheck("my-availability")).toBeTruthy();
      });
    });

    describe("when the given availability and self.tasker.metadata are not the same", function () {
      it("returns false", function () {
        self.tasker = {
          metadata: {
            availability: "my-availability-1"
          }
        };
        expect(self.availabilityShowCheck("my-availability-2")).toBeFalsy();
      });
    });
  });
});
