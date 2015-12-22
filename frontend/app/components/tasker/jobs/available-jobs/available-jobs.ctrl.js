angular.module('tf-client')
.controller('AvailableJobsCtrl', function($stateParams, $state, jobService, categoryService,
                                          authService, alertService) {
  var self = this;

  if (!authService.authorize(["", "tasker"], $stateParams)) return;

  self.alert = $stateParams.alert;
  self.searchText = $stateParams.filter;
  self.currentCategory = { keyword: $stateParams.category };
  self.pages = 0;
  self.currentPage = $stateParams.page;
  self.showEmpty = false;

  self.retrieveJobs = function(filter, page) {
    jobService.getAvailableJobs(filter, page)
      .then(function (data) {
        self.jobs = data.jobs;
        self.pages = data.totalPages;
        self.currentPage = data.currentPage;
        self.showEmpty = self.jobs.length === 0;
      }, function (response) {
        var data = response.data;
        self.alert = alertService.buildError("Jobs could not be retrieved");
      });
  };

  self.retrieveJobs(buildFilter(), self.currentPage);

  self.retrieveCategoryList = function() {
    categoryService.getCategories()
    .then(function (data) {
      self.categories = data;
      self.fillSelectedCategory();
    }, function (response) {
      self.categories = [];
    });
  };

  self.retrieveCategoryList();

  self.applyJobFilter = function() {
    self.loadChange(self.currentPage, self.currentCategory.keyword, self.searchText);
  };

  self.applyCategoryFilter = function(category) {
    self.loadChange(self.currentPage, category.keyword, self.searchText);
  };

  function buildFilter() {
    return {
      $or: {
        name: {
          like: self.searchText
        },
        description: {
          like: self.searchText
        }
      },
      metadata: {
        category: {
          keyword: {
            like: self.currentCategory.keyword
          }
        }
      }
    };
  }

  self.loadChange = function(page, category, filter) {
    if (self.currentCategory.keyword !== category) {
      page = 1;
      filter = '';
    }
    if (self.searchText !== filter) page = 1;
    var params = {
      page: page,
      category: category,
      filter: filter,
      alert: undefined
    };
    $state.go($state.current, params);
  };

  // Why are we doing this ?
  // Okay, this will take the complete information of the current category. This is done because
  // at the begining, the current category only has the keyword, it misses its name and icon.
  self.fillSelectedCategory = function() {
    for (var i = 0; i < self.categories.length; ++i) {
      if (self.currentCategory.keyword === self.categories[i].keyword) {
        self.currentCategory = self.categories[i];
        break;
      }
    }
  };

  self.onPageChange = function(selectedPage) {
    self.loadChange(selectedPage, self.currentCategory.keyword, self.searchText);
  };
});
