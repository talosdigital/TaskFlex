describe("AvailableJobsCtrl", function () {
  beforeEach(module('tf-client'));

  var self, scope, state, stateParams, jobServiceMock, categoryServiceMock, authServiceMock,
      alertServiceMock;

  beforeEach(inject(function($controller, $rootScope, $q) {
    scope = $rootScope.$new();
    state = {
      go: function() { },
      current: {}
    };
    stateParams = {
      filer: 'my-filter',
      category: 'sales',
      page: 2
    },
    jobServiceMock = {
      getAvailableJobs: function() { return $q.defer().promise }
    };
    categoryServiceMock = {
      getCategories: function() { return $q.defer().promise }
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
    self = $controller('AvailableJobsCtrl', {
      $scope: scope,
      $state: state,
      $stateParams: stateParams,
      jobService: jobServiceMock,
      categoryService: categoryServiceMock,
      authService: authServiceMock,
      alertService: alertServiceMock
    });
  }));

  describe("self.searchText", function () {
    it("has the $stateParams.filter value", function () {
      expect(self.searchText).toEqual(stateParams.filter);
    });
  });

  describe("self.currentCategory", function () {
    it("has the $stateParams.category value as 'keyword'", function () {
      expect(self.currentCategory.keyword).toEqual(stateParams.category);
    });
  });

  describe("self.pages", function () {
    it("is 0 initially", function () {
      expect(self.pages).toEqual(0);
    });
  });

  describe("self.currentPage", function () {
    it("has the $stateParams.page value", function () {
      expect(self.currentPage).toEqual(stateParams.page);
    });
  });

  describe("self.retrieveJobs", function () {
    describe("when jobService.getAvailableJobs succeeds", function () {
      it("stores the response jobs in self.jobs", inject(function ($q) {
        var jobsMock = [
          {
            name: "Job 1",
            description: "My description 1"
          },
          {
            name: "Job 2",
            description: "My description 2"
          }
        ];
        expect(self.jobs).toBeUndefined();
        var response = $q.defer();
        spyOn(jobServiceMock, "getAvailableJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: jobsMock });
        scope.$digest();
        expect(self.jobs).toEqual(jobsMock);
      }));

      it("stores the response totalPages self.pages", inject(function ($q) {
        var response = $q.defer();
        spyOn(jobServiceMock, "getAvailableJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: [], totalPages: 5 });
        scope.$digest();
        expect(self.pages).toEqual(5);
      }));

      it("stores the response currentPage self.currentPage", inject(function ($q) {
        var response = $q.defer();
        spyOn(jobServiceMock, "getAvailableJobs").and.returnValue(response.promise);
        self.retrieveJobs();
        response.resolve({ jobs: [], currentPage: 5 });
        scope.$digest();
        expect(self.currentPage).toEqual(5);
      }));
    });

    describe("when jobService.getAvailableJobs fails", function () {
      it("builds an alert with some error message", inject(function ($q) {
        expect(self.alert).toBeUndefined();
        var response = $q.defer();
        spyOn(jobServiceMock, "getAvailableJobs").and.returnValue(response.promise);
        spyOn(alertServiceMock, "buildError");
        self.retrieveJobs();
        response.reject({ status: 400, data: {} });
        scope.$digest();
        expect(alertServiceMock.buildError).toHaveBeenCalled();
      }));
    });
  });

  describe("self.retrieveCategoryList", function () {
    describe("when categoryService.getCategories succeeds", function () {
      it("calls self.fillSelectedCategory", inject(function ($q) {
        var response = $q.defer();
        spyOn(categoryServiceMock, "getCategories").and.returnValue(response.promise);
        spyOn(self, "fillSelectedCategory");
        self.retrieveCategoryList();
        response.resolve([]);
        scope.$digest();
        expect(self.categories).not.toBeUndefined();
        expect(self.categories).toEqual([]);
        expect(self.fillSelectedCategory).toHaveBeenCalled();
      }));
    });

    describe("when categoryService.getCategories fails", function () {
      it("sets the categories empty", inject(function ($q) {
        var response = $q.defer();
        spyOn(categoryServiceMock, "getCategories").and.returnValue(response.promise);
        self.retrieveCategoryList();
        response.reject({ status: 400, data: {} });
        scope.$digest();
        expect(self.categories).not.toBeUndefined();
        expect(self.categories).toEqual([]);
      }));
    });
  });

  describe("self.applyJobFilter", function () {
    it("calls self.loadChange with the current page, category and searchText", function () {
      self.currentPage = 3;
      self.currentCategory = 'sales';
      self.searchText = 'mechanic';
      spyOn(self, "loadChange");
      self.applyJobFilter();
      expect(self.loadChange).toHaveBeenCalled();
    });
  });

  describe("applyCategoryFilter", function () {
    it("calls self.loadChange with the current page, new category and searchText", function () {
      self.currentPage = 3;
      var category = {
        keyword: 'my-cat-keyword'
      };
      self.searchText = 'mechanic';
      spyOn(self, "loadChange");
      self.applyCategoryFilter(category);
      expect(self.loadChange).toHaveBeenCalledWith(3, 'my-cat-keyword', 'mechanic');
    });
  });

  describe("self.loadChange", function () {
    describe("when the given category is different from the current category", function () {
      it("calls the $state.go with parameters including page 1 and empty filter", function () {
        self.currentCategory.keyword = 'category1';
        spyOn(state, "go");
        self.loadChange(4, 'category2', 'my-text');
        expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
          page: 1,
          filter: '',
          category: 'category2'
        }));
      });
    });

    describe("when the given filter is different from the current searchText", function () {
      it("calls the $state.go with parameters including page 1", function () {
        self.currentCategory.keyword = 'category';
        self.searchText = 'my-prev-filter';
        spyOn(state, "go");
        self.loadChange(4, 'category', 'my-new-filter');
        expect(state.go).toHaveBeenCalledWith(state.current, jasmine.objectContaining({
          page: 1,
          filter: 'my-new-filter',
          category: 'category'
        }));
      });
    });
  });

  describe("self.onPageChange", function () {
    it("calls self.loadChange with the given parameter", function () {
      spyOn(self, "loadChange");
      self.onPageChange(6);
      expect(self.loadChange).toHaveBeenCalledWith(6, self.currentCategory.keyword, self.searchText)
    });
  });
});
