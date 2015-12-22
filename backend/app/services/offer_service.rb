class OfferService
  include Singleton

  # Retrieves a list of taskers that are associated to each offer that meets the given filter.
  # @param offer_params [Hash] A hash contaning the filter to be applied to offers.
  # @param page [Integer] Number of page of results to retrieve.
  # @param per_page [Integer] How many items are required to return by page.
  # @return [Hash] A hash containing the list of taskers that are associated to an offer which
  # meets the given (:offers), :total_items, :current_page and :total_pages.
  #   parameters. The format is: each :offer element is a Hash containing :offer_status, :tasker
  #   and :job.
  def taskers_by_offer_params(offer_params, page, per_page)
    response = TD::Jobs::Offer.paginated_search(offer_params, page, per_page)
    result = []
    response['offers'].each do |offer|
      tasker = UserService.instance.user_information(offer.provider_id)
      tasker = UserService.instance.append_picture(tasker)
      unless tasker.nil?
        result.push(offer_status: offer.status, tasker: tasker, job: offer.job)
      end
    end
    response['offers'] = result
    response
  end
end
