angular.module('tf-client')
.directive('tfDropdown', function() {
  return {
    restrict: 'E',
    scope: {
      tfHeadText: '=',
      tfHeadIcon: '=',
      tfItems: '=',
      tfClickItem: '=',
      tfItemText: '=',
      tfShowCheck: '='
    },
    link: function(scope, elem) {
      var dropdown = $(elem).children();
      // Setup the search by hitting key
      $(dropdown).on('shown.bs.dropdown', function () {
        var $this = $(this);
        // Attach key listener when dropdown is shown
        $(document).keypress(function(e) {
          // Get the key that was pressed
          var key = String.fromCharCode(e.which);
          // Look at all of the items to find a first char match
          var found = false;
          $this.find("li").each(function(idx, item) {
            var text = $.trim($(item).text());
            if (text.charAt(0).toLowerCase() == key) {
              scope.$apply(function() {
                scope.tfClickItem(scope.tfItems[idx]);
                $(item).focus();
              });
              return false; // Stop looking for elements
            }
          });
        });
      });

      $(dropdown).on('hide.bs.dropdown', function () {
        // Unbind key event when dropdown is hidden
        $(document).unbind("keypress");
      });
    },
    templateUrl: 'directives/dropdown/tf-dropdown.html'
  };
});
