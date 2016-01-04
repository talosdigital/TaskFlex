angular.module('tf-client')
.config(function($stateProvider){
  $stateProvider.state('dealConfirmation', {
    url: '/deal-confirmation?id',
    params: {
      id: undefined,
      offer: undefined // Will try to take this offer, if undefined, will fetch it with the id.
    },
    templateUrl: 'components/owner/deal-confirmation/deal-confirmation.html',
    controller: 'DealConfirmationCtrl as deal'
  })
});
