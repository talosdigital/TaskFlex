describe('InviteCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, localStorage, filter, state, categoryServiceMock, jobServiceMock,
      invitationServiceMock, locationsServiceMock, taskerServiceMock, ownerServiceMock,
      authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    localStorage = {
      user: {
        id: 'my-owner-id',
        firstName: "Santiago",
        email: "santiago@santiago.com"
      },
    };
    state = {
      go: function() { }
    };
    stateParams = {
      tasker: 'some-tasker-id'
    };
    filter = function() { return function() { } };
    categoryServiceMock = {
      getCategories: function() { return $q.defer().promise }
    };
    jobServiceMock = {
      createJob: function() { return $q.defer().promise },
      updateJobStatus: function() { return $q.defer().promise },
      getAvailableJobs: function() { return $q.defer().promise },
      createAndInvite: function() { return $q.defer().promise }
    };
    invitationServiceMock = {
      createInvitation: function() { return $q.defer().promise },
      createAndSendInvitation: function() { return $q.defer().promise }
    };
    locationsServiceMock = {
      getCountries: function() { return $q.defer().promise },
      countryInfo: function() { return $q.defer().promise }
    };
    taskerServiceMock = {
      getTaskerInfo: function() { return $q.defer().promise }
    };
    ownerServiceMock = {
      getAllActiveJobs: function() { return $q.defer().promise }
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
    self = $controller('InviteCtrl', {
      $scope: scope,
      $localStorage: localStorage,
      $state: state,
      $stateParams: stateParams,
      $filter: filter,
      categoryService: categoryServiceMock,
      jobService: jobServiceMock,
      invitationService: invitationServiceMock,
      locationsService: locationsServiceMock,
      taskerService: taskerServiceMock,
      ownerService: ownerServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.options", function () {
    it("has two default options with submitted false", function () {
      expect(self.options.length).toEqual(2);
      expect(self.options[0]).toEqual(jasmine.objectContaining({
        submitted: false,
        jobType: 'choose'
      }));
      expect(self.options[1]).toEqual(jasmine.objectContaining({
        submitted: false,
        jobType: 'create'
      }))
    });
  });

  describe("self.jobType", function () {
    it("is 'choose' by default'", function () {
      expect(self.jobType).toEqual('choose');
    });
  });

  describe("self.jobs", function () {
    it("is an empty array by default", function () {
      expect(self.jobs).toEqual([]);
    });
  });

  describe("self.categories", function () {
    it("is an empty array by default", function () {
      expect(self.categories).toEqual([]);
    });
  });

  describe("self.countries", function () {
    it("is an empty array by default", function () {
      expect(self.countries).toEqual([]);
    });
  });

  describe("self.cities", function () {
    it("is an empty array by default", function () {
      expect(self.cities).toEqual([]);
    });
  });

  describe("self.chosenJob", function () {
    it("is an empty object by default", function () {
      expect(self.chosenJob).toEqual({});
    });
  });

  describe("self.validChosenJob", function () {
    it("is false by default", function () {
      expect(self.validChosenJob).toBeFalsy();
    });
  });

  describe("self.owner", function () {
    it("has a defined additionalEmails property", function () {
      expect(self.owner.additionalEmails).toBeDefined();
    });

    describe("when the $localStorage has a user", function () {
      it("has some values retrieved from $localStorage.user", function () {
        expect(self.owner.name).toEqual(localStorage.user.firstName);
        expect(self.owner.email).toEqual(localStorage.user.email);
      });
    });
  });

  describe("self.tasker", function () {
    it("has the $stateParams.tasker as value in id property", function () {
      expect(self.tasker.id).toEqual(stateParams.tasker);
    });
  });

  describe("self.maxLength", function () {
    it("has a default value of 500", function () {
      expect(self.maxLength).toEqual(500);
    });
  });

  describe("self.invitation", function () {
    it("has a default description property defined", function () {
      expect(self.invitation.description).toBeDefined();
    });
  });

  describe("self.retrieveOwnerJobs", function () {
    it("calls ownerService.getAllActiveJobs", inject(function ($q) {
      spyOn(ownerServiceMock, "getAllActiveJobs").and.returnValue($q.defer().promise);
      self.retrieveOwnerJobs();
      expect(ownerServiceMock.getAllActiveJobs).toHaveBeenCalled();
    }));

    describe("when ownerService.getAllActiveJobs succeeds", function () {
      it("sets self.jobs to the response", inject(function ($q) {
        var jobsMock = [
          {
            name: "My first job",
            description: "This is my first job"
          },
          {
            name: "My second job",
            description: "This is my second job"
          }
        ];
        var response = $q.defer();
        spyOn(ownerServiceMock, "getAllActiveJobs").and.returnValue(response.promise);
        self.retrieveOwnerJobs();
        response.resolve({ jobs: jobsMock });
        scope.$digest();
        expect(self.jobs).toEqual(jobsMock);
      }));
    });

    describe("when ownerService.getAllActiveJobs fails", function () {
      it("builds an error alert", inject(function ($q) {
        var response = $q.defer();
        spyOn(ownerServiceMock, "getAllActiveJobs").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        self.retrieveOwnerJobs();
        response.reject({});
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      }));
    });
  });

  describe("self.retrieveCategories", function () {
    describe("when categoryService.getCategories succeeds", function () {
      it("sets the response to self.categories", inject(function ($q) {
        expect(self.categories).toEqual([]);
        var categoriesMock = [
          {
            name: "Sales & Marketing",
            keyword: "sales"
          },
          {
            name: "Second category",
            keyword: "second"
          }
        ];
        var response = $q.defer();
        spyOn(categoryServiceMock, "getCategories").and.returnValue(response.promise);
        self.retrieveCategories();
        response.resolve(categoriesMock);
        scope.$digest();
        expect(self.categories).toEqual(categoriesMock);
      }));
    });

    describe("when categoryService.getCategories fails", function () {
      it("sets self.categories to empty", inject(function ($q) {
        var response = $q.defer();
        spyOn(categoryServiceMock, "getCategories").and.returnValue(response.promise);
        self.retrieveCategories();
        response.reject({ status: 400, data: {} });
        scope.$digest();
        expect(self.categories).toEqual([]);
      }));
    });
  });

  describe("self.retrieveTaskerInfo", function () {
    describe("when the given taskerId is defined", function () {
      describe("when taskerService.getTaskerInfo succeeds", function () {
        it("sets the response data to self.tasker", inject(function ($q) {
          var response = $q.defer();
          var taskerMock = {
            firstName: "Santiago",
            lastName: "Vanegas",
            id: "abcabcabcabc"
          };
          spyOn(taskerServiceMock, "getTaskerInfo").and.returnValue(response.promise);
          self.retrieveTaskerInfo(1);
          response.resolve(taskerMock);
          scope.$digest();
          expect(self.tasker).toEqual(taskerMock);
        }));
      });

      describe("when taskerService.getTaskerInfo fails", function () {
        it("builds an error alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getTaskerInfo").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveTaskerInfo(1);
          response.reject({});
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));

        it("sets self.taskerFound to false", inject(function ($q) {
          var response = $q.defer();
          spyOn(taskerServiceMock, "getTaskerInfo").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveTaskerInfo(1);
          response.reject({});
          scope.$digest();
          expect(self.taskerFound).toBeFalsy();
        }));
      });
    });

    describe("when the givent taskerId is not defined", function () {
      it("builds an error alert", function () {
        spyOn(alertServiceMock, "buildError");
        self.retrieveTaskerInfo(undefined);
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      });

      it("sets self.taskerFound to false", function () {
        spyOn(alertServiceMock, "buildError");
        self.retrieveTaskerInfo(undefined);
        expect(self.taskerFound).toBeFalsy();
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

  describe("self.removeEmail", function () {
    it("removes one array element from self.owner.additionalEmails", function () {
      self.owner = {
        additionalEmails: ["mail1@mail.com", "mail2@mail.com", "mail3@mail.com"]
      };
      self.removeEmail(1);
      expect(self.owner.additionalEmails).toEqual(["mail1@mail.com", "mail3@mail.com"]);
    });
  });

  describe("self.sendInvitation", function () {
    describe("when self.validateForm returns false", function () {
      it("doesn't call neither self.createInvitation nor jobService.createAndInvite", function () {
        spyOn(self, "validateForm").and.returnValue(false);
        spyOn(self, "createInvitation");
        spyOn(jobServiceMock, "createAndInvite");
        self.sendInvitation(false);
        expect(self.createInvitation).not.toHaveBeenCalled();
        expect(jobServiceMock.createAndInvite).not.toHaveBeenCalled();
      });
    });

    describe("when self.validateForm returns true", function () {
      describe("when self.jobType is the first option's jobType", function () {
        it("fills the invitation and calls self.createInvitation", function () {
          spyOn(self, "validateForm").and.returnValue(true);
          self.jobType = self.options[0].jobType = 'choose'; // First option's jobType
          self.chosenJob = {
            id: 44
          };
          self.tasker = {
            id: 10
          };
          spyOn(self, "createInvitation");
          self.sendInvitation(true);
          expect(self.invitation.jobId).toEqual(44);
          expect(self.invitation.providerId).toEqual(10);
          expect(self.createInvitation).toHaveBeenCalledWith(self.invitation);
        });
      });

      describe("when self.jobType is the second option's jobType", function () {
        describe("when jobService.createAndInvite succeeds", function () {
          it("goes to myTaskers.findTasker state with a success alert", inject(function ($q) {
            self.options[0].jobType = 'choose';
            self.jobType = 'create'; // Second option's jobType
            var response = $q.defer();
            spyOn(self, "validateForm").and.returnValue(true);
            spyOn(jobServiceMock, "createAndInvite").and.returnValue(response.promise);
            spyOn(alertServiceMock, "buildSuccess").and.returnValue({
              message: "This is my alert",
              error: false
            });
            spyOn(state, "go");
            self.sendInvitation(true);
            response.resolve({});
            scope.$digest();
            expect(state.go).toHaveBeenCalledWith('myTaskers.findTasker', jasmine.objectContaining({
              alert: jasmine.objectContaining({
                message: "This is my alert",
                error: false
              })
            }));
          }));
        });

        describe("when jobService.createAndInvite fails", function () {
          describe("when the response status is 400", function () {
            it("builds a failure alert", inject(function ($q) {
              self.options[0].jobType = 'choose';
              self.jobType = 'create'; // Second option's jobType
              var response = $q.defer();
              spyOn(self, "validateForm").and.returnValue(true);
              spyOn(jobServiceMock, "createAndInvite").and.returnValue(response.promise);
              spyOn(alertServiceMock, "buildError");
              self.sendInvitation(true);
              response.reject({ status: 400, data: {} });
              scope.$digest();
              expect(alertServiceMock.buildError).toHaveBeenCalled();
            }));
          });

          describe("when the response status is 401", function () {
            it("goes to landing state", inject(function ($q) {
              self.options[0].jobType = 'choose';
              self.jobType = 'create'; // Second option's jobType
              var response = $q.defer();
              spyOn(self, "validateForm").and.returnValue(true);
              spyOn(jobServiceMock, "createAndInvite").and.returnValue(response.promise);
              spyOn(state, "go");
              self.sendInvitation(true);
              response.reject({ status: 401, data: {} });
              scope.$digest();
              expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
            }));
          });

          describe("when the response status is 404", function () {
            it("builds a failure alert", inject(function ($q) {
              self.options[0].jobType = 'choose';
              self.jobType = 'create'; // Second option's jobType
              var response = $q.defer();
              spyOn(self, "validateForm").and.returnValue(true);
              spyOn(jobServiceMock, "createAndInvite").and.returnValue(response.promise);
              spyOn(alertServiceMock, "buildError");
              self.sendInvitation(true);
              response.reject({ status: 404, data: {} });
              scope.$digest();
              expect(alertServiceMock.buildError).toHaveBeenCalled();
            }));
          });

          describe("when the status code is niether 400 nor 401", function () {
            it("builds a failure alert", inject(function ($q) {
              self.options[0].jobType = 'choose';
              self.jobType = 'create'; // Second option's jobType
              var response = $q.defer();
              spyOn(self, "validateForm").and.returnValue(true);
              spyOn(jobServiceMock, "createAndInvite").and.returnValue(response.promise);
              spyOn(alertServiceMock, "buildError");
              self.sendInvitation(true);
              response.reject({ status: 500, data: {} });
              scope.$digest();
              expect(alertServiceMock.buildError).toHaveBeenCalled();
            }));
          });
        });
      });
    });
  });

  describe("self.validateForm", function () {
    describe("when the given validForm is false", function () {
      it("immediately returns false", function () {
        expect(self.validateForm(false)).toBeFalsy();
      });
    });

    describe("when self.jobType is the same as first option's jobType", function () {
      it("sets the first option as submitted", function () {
        self.options[0].submitted = false;
        self.options[0].jobType = self.jobType = 'choose';
        self.validateForm(true);
        expect(self.options[0].submitted).toBeTruthy();
      });

      describe("when self.chosenJob has no keys", function () {
        it("returns false", function () {
          self.options[0].jobType = self.jobType = 'choose';
          self.chosenJob = {};
          expect(self.validateForm(true)).toBeFalsy();
        });
      });

      describe("when self.chosenJob has keys", function () {
        it("returns true", function () {
          self.options[0].jobType = self.jobType = 'choose';
          self.chosenJob = { morning: "i'm a key", notEmpty: true };
          expect(self.validateForm(true)).toBeTruthy();
        });
      });
    });

    describe("when self.jobType is the same as second option's jobType", function () {
      it("sets the second option as submitted", function () {
        self.options[0].jobType = 'choose';
        self.jobType = 'create';
        self.options[1].submitted = false;
        spyOn(self, "checkCategory");
        self.validateForm(true);
      });

      it("calls self.checkCategory", function () {
        self.options[0].jobType = 'choose';
        self.jobType = 'create';
        spyOn(self, "checkCategory");
        self.validateForm(true);
        expect(self.checkCategory).toHaveBeenCalled();
      });
    });
  });

  describe("self.checkCategory", function () {
    describe("when self.newJob.metadata.category is an empty object", function () {
      it("returns false", function () {
        self.newJob = {
          metadata: {
            category: {}
          }
        };
        expect(self.checkCategory()).toBeFalsy();
      });
    });

    describe("when self.newJob.metadata.category has at least one key", function () {
      it("returns true", function () {
        self.newJob = {
          metadata: {
            category: {
              name: "my-category"
            }
          }
        };
        expect(self.checkCategory()).toBeTruthy();
      });
    });
  });

  describe("self.selectCountry", function () {
    it("sets the given country to self.newJob.metadata.country", function () {
      self.newJob = {
        metadata: {
          country: undefined
        }
      };
      var countryMock = {
        name: "Colombia",
        alpha3Code: "COL"
      };
      spyOn(locationsServiceMock, "countryInfo").and.returnValue(countryMock);
      self.selectCountry({ name: "Colombia" });
      expect(self.newJob.metadata.country).toEqual({ name: "Colombia", alpha3Code: "COL" });
    });

    describe("when given country callingCodes attribute is defined", function () {
      it("sets the first calling code to self.owner.callingCode", function () {
        self.owner = {};
        self.selectCountry({ callingCodes: ["57"] });
        expect(self.owner.callingCode).toEqual("+57");
      });
    });
  });

  describe("self.createInvitation", function () {
    describe("when invitationService.createAndSendInvitation succeeds", function () {
      it("builds a success alert and goes to myTaskers.findTasker state", inject(function ($q) {
        var response = $q.defer();
        spyOn(invitationServiceMock, "createAndSendInvitation").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildSuccess").and.returnValue({
          message: "This is my alert",
          error: false
        });
        spyOn(state, "go");
        self.createInvitation();
        response.resolve({});
        scope.$digest();
        expect(state.go).toHaveBeenCalledWith('myTaskers.findTasker', jasmine.objectContaining({
          alert: jasmine.objectContaining({
            message: "This is my alert",
            error: false
          })
        }));
      }));
    });

    describe("when invitationService.createAndSendInvitation fails", function () {
      it("builds a failure alert", inject(function ($q) {
        var response = $q.defer();
        spyOn(invitationServiceMock, "createAndSendInvitation").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        self.createInvitation();
        response.reject({});
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      }));
    });
  });

  describe("self.jobItemClicked", function () {
    it("sets the given job to self.chosenJob", function () {
      self.chosenJob = undefined;
      self.jobItemClicked({ name: "my-job" });
      expect(self.chosenJob).toEqual({ name: "my-job" });
    });
  });

  describe("self.jobItemText", function () {
    it("returns the given job's name", function () {
      expect(self.jobItemText({ name: "my-job-name" })).toEqual("my-job-name");
    });
  });

  describe("self.jobShowCheck", function () {
    describe("when the given job name is the same as the self.chosenJob's name", function () {
      it("returns true", function () {
        self.chosenJob = {
          name: "my-job-name"
        };
        expect(self.jobShowCheck({ name: "my-job-name" })).toBeTruthy();
      });
    });

    describe("when the given job name is not the same as the self.chosenJob's name", function () {
      it("returns false", function () {
        self.chosenJob = {
          name: "my-job-name-1"
        };
        expect(self.jobShowCheck({ name: "my-job-name-2" })).toBeFalsy();
      });
    });
  });

  describe("self.categoryItemClicked", function () {
    it("sets the given category to self.newJob.metadata.category", function () {
      self.newJob.metadata.category = undefined;
      self.categoryItemClicked({ name: "my-category" });
      expect(self.newJob.metadata.category).toEqual({ name: "my-category" });
    });
  });

  describe("self.categoryItemText", function () {
    it("returns the given category's name", function () {
      expect(self.categoryItemText({ name: "my-category-name" })).toEqual("my-category-name");
    });
  });

  describe("self.categoryShowCheck", function () {
    describe("when the given category keyword is the same as the self.newJob's one", function () {
      it("returns true", function () {
        self.newJob = {
          metadata: {
            category: {
              keyword: "my-job-category"
            }
          }
        };
        expect(self.categoryShowCheck({ keyword: "my-job-category" })).toBeTruthy();
      });
    });

    describe("when the given category keyword is not the self.newJob's one", function () {
      it("returns false", function () {
        self.newJob = {
          metadata: {
            category: {
              keyword: "my-category-keyword-1"
            }
          }
        };
        expect(self.categoryShowCheck({ keyword: "my-category-keyword-2" })).toBeFalsy();
      });
    });
  });

  describe("self.countryItemText", function () {
    it("returns the given country's name", function () {
      expect(self.countryItemText({ name: "my-country-name" })).toEqual("my-country-name");
    });
  });

  describe("self.countryShowCheck", function () {
    describe("when the given country code is the same as the self.newJob's one", function () {
      it("returns true", function () {
        self.newJob = {
          metadata: {
            country: {
              alpha3Code: "RUS"
            }
          }
        };
        expect(self.countryShowCheck({ alpha3Code: "RUS" })).toBeTruthy();
      });
    });

    describe("when the given country name is not the self.newJob's one", function () {
      it("returns false", function () {
        self.newJob = {
          metadata: {
            country: {
              alpha3Code: "ABC"
            }
          }
        };
        expect(self.countryShowCheck({ alpha3Code: "DEF" })).toBeFalsy();
      });
    });
  });
});
