angular.module('tf-client-services')
.factory('alertService', function() {
  var messages = {
    unauthorized: {
      message: "You are not authorized to do this operation",
      error: true
    },
    badRequest: {
      message: "There was an error in your request, please try again",
      error: true
    },
    unknownError: {
      message: "An unknown error ocurred, please try again",
      error: true
    }
  };

  function build(type, alternateMessage, alternateError) {
    var alert = messages[type];
    if (!angular.isDefined(alert)) {
      alert = {
        message: alternateMessage,
        error: alternateError
      }
    }
    return alert;
  }

  function buildError(message, alternate) {
    return {
      message: angular.isString(message) ? message : alternate,
      error: true
    };
  }

  function buildSuccess(message, alternate) {
    return {
      message: angular.isString(message) ? message : alternate,
      error: false
    };
  }

  function buildCustom(message, error, alternate) {
    return {
      message: angular.isString(message) ? message : alternate,
      error: error
    };
  }

  return {
    'build': build,
    'buildError': buildError,
    'buildSuccess': buildSuccess,
    'buildCustom': buildCustom
  };
});
