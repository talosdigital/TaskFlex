describe('PostJobCtrl', function() {
  beforeEach(module('tf-client'));

  var self, scope, stateParams, state, cookies, localStorage, filter, categoryServiceMock,
      locationsServiceMock, jobServiceMock, authServiceMock, alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    stateParams = {
      newJob: {
        name: "This is the job that I was building",
        description: "Amazing job"
      }
    };
    state = {
      go: function() { },
      current: 'postJob'
    };
    cookies = {
      get: function() { },
    };
    localStorage = {
      user: {
        id: 'my-owner-id',
        firstName: "Santiago",
        email: "santiago@santiago.com"
      },
    };
    filter = function() { return function() { } };
    stateParams = {
      tasker: 'some-tasker-id'
    };
    categoryServiceMock = {
      getCategories: function() { return $q.defer().promise }
    };
    locationsServiceMock = {
      getCountries: function() { return $q.defer().promise },
      countryInfo: function() { return $q.defer().promise }
    };
    jobServiceMock = {
      createJob: function() { return $q.defer().promise },
      updateJobStatus: function() { return $q.defer().promise },
      updateJob: function() { return $q.defer().promise },
      searchJob: function() { return $q.defer().promise },
      getJobById: function() { return $q.defer().promise }
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
    self = $controller('PostJobCtrl', {
      $scope: scope,
      $stateParams: stateParams,
      $state: state,
      $cookies: cookies,
      $localStorage: localStorage,
      $filter: filter,
      categoryService: categoryServiceMock,
      locationsService: locationsServiceMock,
      jobService: jobServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.steps", function () {
    it("has three default options", function () {
      expect(self.steps.length).toEqual(3);
      expect(self.steps[0]).toEqual(jasmine.objectContaining({
        name: "Basic Info",
        key: "basic"
      }));
      expect(self.steps[1]).toEqual(jasmine.objectContaining({
        name: "Contact Info",
        key: "contact"
      }));
      expect(self.steps[2]).toEqual(jasmine.objectContaining({
        name: "Job Details",
        key: "details"
      }));
    });
  });

  describe("self.currentStep", function () {
    it("is 0 by default", function () {
      expect(self.currentStep).toEqual(0);
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

  describe("self.validCategory", function () {
    it("is true by default", function () {
      expect(self.validCategory).toBeFalsy();
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

  describe("self.newJob", function () {
    it("is defined by default", function () {
      expect(self.newJob).toBeDefined();
    });
  });

  describe("self.today", function () {
    it("is defined by default", function () {
      expect(self.today).toBeDefined();
    });
  });

  describe("self.retrieveJobToEdit", function () {
    describe("when jobService.getJobById succeeds", function () {
      it("calls self.fillData with the response job", inject(function ($q) {
        var response = $q.defer();
        var jobMock = {
          name: "my-job-name",
          description: "Really cool job"
        };
        spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
        spyOn(self, "fillData");
        self.retrieveJobToEdit(1);
        response.resolve(jobMock);
        scope.$digest();
        expect(self.fillData).toHaveBeenCalledWith(jobMock);
      }));
    });

    describe("when jobService.getJobById fails", function () {
      describe("when response status is 400", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveJobToEdit(1);
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when response status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
          spyOn(state, "go");
          self.retrieveJobToEdit(1);
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when response status is neither 400 nor 401", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(jobServiceMock, "getJobById").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.retrieveJobToEdit(1);
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
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
    describe("when the given index is less than 0", function () {
      it("does nothing", function () {
        self.owner.additionalEmails = ["hello@hello.com", "hey@hey.com"];
        self.removeEmail(-1);
        expect(self.owner.additionalEmails).toEqual(["hello@hello.com", "hey@hey.com"]);
      });
    });

    describe("when the given index is more than the last index", function () {
      it("does nothing", function () {
        self.owner.additionalEmails = ["hello@hello.com", "hey@hey.com"];
        self.removeEmail(2);
        expect(self.owner.additionalEmails).toEqual(["hello@hello.com", "hey@hey.com"]);
      });
    });

    describe("when the given index is a valid additional email", function () {
      it("removes it from the list", function() {
        self.owner.additionalEmails = ["hello@hello.com", "cha@cha.com", "hey@hey.com"];
        self.removeEmail(1);
        expect(self.owner.additionalEmails).toEqual(["hello@hello.com", "hey@hey.com"]);
      })
    });

    describe("self.goToStep", function () {
      describe("when the given step is not the next of last", function () {
        describe("when self.fieldsCompleted returns true", function () {
          it("sets the given step to self.currentStep", function () {
            self.currentStep = 0;
            self.steps = [{}, {}, {}];
            spyOn(self, "submit");
            spyOn(self, "fieldsCompleted").and.returnValue(true);
            self.goToStep(0);
            expect(self.currentStep).toEqual(0);
            self.goToStep(1);
            expect(self.currentStep).toEqual(1);
            self.goToStep(2);
            expect(self.currentStep).toEqual(2);
            expect(self.submit).not.toHaveBeenCalled();
          });
        });

        describe("when self.fieldsCompleted returns false", function () {
          it("doesn't modify self.currentStep neither calls self.submit", function () {
            self.currentStep = 0;
            self.steps = [{}, {}, {}];
            spyOn(self, "submit");
            spyOn(self, "fieldsCompleted").and.returnValue(false);
            self.goToStep(1);
            expect(self.currentStep).toEqual(0);
            self.goToStep(2);
            expect(self.currentStep).toEqual(0);
            expect(self.submit).not.toHaveBeenCalled();
          });
        });
      });

      describe("when the given step is the next of the last", function () {
        describe("when self.fieldsCompleted returns true", function () {
          it("calls the self.submit method", function () {
            self.currentStep = 0;
            self.steps = [{}, {}, {}];
            spyOn(self, "submit");
            spyOn(self, "fieldsCompleted").and.returnValue(true);
            self.goToStep(3);
            expect(self.submit).toHaveBeenCalled();
          });
        });

        describe("when self.fieldsCompleted returns false", function () {
          it("doesn't call the self.submit method", function () {
            self.currentStep = 0;
            self.steps = [{}, {}, {}];
            spyOn(self, "submit");
            spyOn(self, "fieldsCompleted").and.returnValue(false);
            self.goToStep(3);
            expect(self.submit).not.toHaveBeenCalled();
            expect(self.currentStep).toEqual(0);
          });
        });
      });
    });
  });

  describe("self.fieldsCompleted", function () {
    describe("when all forms and category are valid", function () {
      describe("when category is valid", function () {
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
          spyOn(self, "checkCategory").and.returnValue(true);
          expect(self.fieldsCompleted(self.steps.length)).toBeTruthy();
        });
      });

      describe("when category is not valid", function () {
        it("returns false", function () {
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
          spyOn(self, "checkCategory").and.returnValue(false);
          expect(self.fieldsCompleted(self.steps.length)).toBeFalsy();
        });
      });
    });

    describe("when there is some step not valid", function () {
      it("it sets the invalid step to self.currentStep", function () {
        self.currentStep = 0;
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
              $valid: true
            }
          }
        ];
        spyOn(self, "checkCategory").and.returnValue(true);
        self.fieldsCompleted(self.steps.length);
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
        spyOn(self, "checkCategory").and.returnValue(true);
        expect(self.fieldsCompleted(self.steps.length)).toBeFalsy();;
      });
    });
  });

  describe("self.checkCategory", function () {
    describe("when self.newJob.metadata.category is an empty Object", function () {
      it("returns false", function () {
        self.newJob = {
          metadata: {
            category: { }
          }
        };
        expect(self.checkCategory()).toBeFalsy();
      });
    });

    describe("when self.newJob.metadata.category is not an empty Object", function () {
      it("returns true", function () {
        self.newJob = {
          metadata: {
            category: {
              name: "Sales",
              keyword: "sales"
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
        metadata: {
          country: undefined
        }
      };
      var countryMock = {
        name: 'some-country',
        alpha3Code: 'my-code'
      }
      spyOn(locationsServiceMock, "countryInfo").and.returnValue(countryMock);
      self.selectCountry({ name: 'some-country' });
      expect(self.newJob.metadata.country).toEqual(countryMock);
    });

    describe("when given country callingCodes attribute is defined", function () {
      it("sets the first calling code to self.owner.callingCode", function () {
        self.owner = {};
        self.selectCountry({ callingCodes: ["57"] });
        expect(self.owner.callingCode).toEqual("+57");
      });
    });
  });

  describe("self.updateJob", function () {
    describe("when jobService.updateJob succeeds", function () {
      it("builds a success alert and goes to jobDetails state edited job id", inject(function ($q) {
        var response = $q.defer();
        spyOn(jobServiceMock, "updateJob").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildSuccess");
        spyOn(state, "go");
        self.editing = 1;
        self.updateJob();
        response.resolve({});
        scope.$digest();
        expect(alertServiceMock.buildSuccess).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith('jobDetails', jasmine.objectContaining({
          job: 1
        }));
      }));
    });

    describe("when jobService.updateJob fails", function () {
      describe("when response status is 400", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(jobServiceMock, "updateJob").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.updateJob();
          response.reject({ status: 400, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });

      describe("when response status is 401", function () {
        it("goes to landing state", inject(function ($q) {
          var response = $q.defer();
          spyOn(jobServiceMock, "updateJob").and.returnValue(response.promise);
          spyOn(state, "go");
          self.updateJob();
          response.reject({ status: 401, data: {} });
          scope.$digest();
          expect(state.go).toHaveBeenCalledWith('landing', jasmine.anything());
        }));
      });

      describe("when response status is neither 400 nor 401", function () {
        it("builds a failure alert", inject(function ($q) {
          var response = $q.defer();
          spyOn(jobServiceMock, "updateJob").and.returnValue(response.promise);
          spyOn(alertServiceMock, "buildError");
          self.updateJob();
          response.reject({ status: 500, data: {} });
          scope.$digest();
          expect(alertServiceMock.buildError).toHaveBeenCalled();
        }));
      });
    });
  });

  describe("self.categoryItemClicked", function () {
    it("sets the given category to self.newJob.metadata.category", function () {
      spyOn(self, "checkCategory");
      self.newJob = {
        metadata: {
          category: undefined
        }
      };
      self.categoryItemClicked({ name: 'my-category' });
      expect(self.newJob.metadata.category).toEqual({ name: 'my-category' });
    });

    it("calls self.checkCategory", function () {
      spyOn(self, "checkCategory");
      self.categoryItemClicked();
      expect(self.checkCategory).toHaveBeenCalled();
    });
  });

  describe("self.categoryItemText", function () {
    it("returns the given category's name", function () {
      var category = {
        name: "my-category-name"
      };
      expect(self.categoryItemText(category)).toEqual('my-category-name');
    });
  });

  describe("self.categoryShowCheck", function () {
    describe("when the given category keyword is the same as self.newJob's one", function () {
      it("returns true", function () {
        self.newJob = {
          metadata: {
            category: {
              keyword: 'my-category-keyword'
            }
          }
        };
        var category = {
          keyword: 'my-category-keyword'
        };
        expect(self.categoryShowCheck(category)).toBeTruthy();
      });
    });

    describe("when the given category keyword is not the same as self.newJob's one", function () {
      it("returns false", function () {
        self.newJob = {
          metadata: {
            category: {
              keyword: 'my-category-keyword-1'
            }
          }
        };
        var category = {
          keyword: 'my-category-keyword-2'
        };
        expect(self.categoryShowCheck(category)).toBeFalsy();
      });
    });
  });

  describe("self.countryItemText", function () {
    it("returns the given country name", function () {
      var country = {
        name: "my-country-name"
      };
      expect(self.countryItemText(country)).toEqual('my-country-name');
    });
  });

  describe("self.countryShowCheck", function () {
    describe("when self.newJob's country and given country have the same alpha3Code", function () {
      it("returns true", function () {
        self.newJob = {
          metadata: {
            country: {
              alpha3Code: "ABC"
            }
          }
        };
        var country = {
          alpha3Code: "ABC"
        };
        expect(self.countryShowCheck(country)).toBeTruthy();
      });
    });

    describe("when self.newJob's and given country have not the same alpha3Code", function () {
      it("returns false", function () {
        self.newJob = {
          metadata: {
            country: {
              alpha3Code: "ABC"
            }
          }
        };
        var country = {
          alpha3Code: "DEF"
        };
        expect(self.countryShowCheck(country)).toBeFalsy();
      });
    });
  });
});
