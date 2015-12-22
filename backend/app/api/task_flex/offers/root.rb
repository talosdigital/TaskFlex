module TaskFlex
  module Offers
    class Root < Grape::API

      desc 'searches for offers'
      params do
        optional :provider_id, type: String, desc: "The id of the offer's provider"
        optional :job_id, type: Integer, desc: "The id of the offer's job"
        optional :status, type: Array[String], desc: "The offer's status"
        optional :created_at_from, type: Date, desc: "The start of the range for the offer's date"
        optional :created_at_to, type: Date, desc: "The end of the range for the offer's date"
      end
      get do
        authorize! :tasker, :owner
        begin
          present TD::Jobs::Offer.search(params)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets all offers of a tasker, including owner information'
      params do
        # provider_id is retrieved from header token
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get 'tasker' do
        authorize! :tasker
        begin
          tasker = current_user
          offer_params = { provider_id: tasker.id }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          response = TD::Jobs::Offer.paginated_search(offer_params, page, per_page)
          result = []
          response['offers'].each do |offer|
            owner_found = UserService.instance.user_information(offer.job.owner_id,
                                                                :email, :first_name, :last_name)
            item = offer.to_hash_without_nils
            item[:owner] = owner_found
            result.push(item)
          end
          response['offers'] = result
          present response
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets all offers of an owner, only sent, resent and returned'
      params do
        # owner_id is retrieved from header token
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get 'owner' do
        authorize! :owner
        begin
          owner = current_user
          job_filter = { owner_id: owner.id }
          offer_params = { status: [:SENT, :RESENT, :RETURNED], job_filter: job_filter.to_json }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present TD::Jobs::Offer.paginated_search(offer_params, page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets an offer by id'
      params do
        requires :id, type: Integer, desc: 'The id of the Offer'
      end
      get ':id' do
        authorize! :tasker, :owner
        begin
          offer = TD::Jobs::Offer.find(params[:id])
          tasker = UserService.instance.user_information(offer.provider_id)
          tasker = UserService.instance.append_picture(tasker)
          owner = UserService.instance.user_information(offer.job.owner_id)
          owner = UserService.instance.append_picture(owner)
          response = offer.to_hash_without_nils
          response[:job] = response[:job].to_hash_without_nils
          response.delete(:provider_id)
          response[:tasker] = tasker.to_hash_without_nils.slice(:id, :first_name, :last_name)
          response[:tasker][:metadata] = { picture: tasker.metadata[:picture] }
          response[:job].delete(:owner_id)
          response[:owner] = owner.to_hash_without_nils.slice(:id, :first_name, :last_name)
          response[:owner][:metadata] = { picture: owner.metadata[:picture] }
          present response
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'creates a new offer'
      params do
        # provider_id is retrieved from header token.
        requires :job_id, type: Integer, desc: "The id of the offer's job"
        optional :invitation_id, type: Integer, desc: 'The invitation id, if there is one'
        optional :description, type: String, desc: "The offer's description"
        optional :metadata, type: Hash, desc: "The offer's metadata"
        optional :accept, type: Boolean, desc: "If the given invitation should be accepted before"\
                                               "creating the offer"
        optional :auto_send, type: Boolean, default: true, desc: "If the offer should be sent "\
                                                                 "after created"
      end
      post do
        authorize! :tasker
        begin
          attrs = params
          attrs.merge!(provider_id: current_user.id)
          begin
            if attrs[:accept] && attrs[:invitation_id]
              invitation = TD::Jobs::Invitation.accept(attrs[:invitation_id])
            end
          rescue TD::Jobs::InvalidStatus => exception
            # Do nothing if the invitation couldn't be accepted.
          end
          offer = TD::Jobs::Offer.create(attrs.except(:accept))
          offer.send if params[:auto_send]
          if attrs[:accept] && attrs[:invitation_id]
            TaskFlexNotificator.delay.accept_invitation(invitation, offer.id)
          end
          present offer
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'sends an offer'
      params do
        requires :id, type: Integer, desc: 'The id of the offer to be sent'
      end
      put ':id/send' do
        authorize! :tasker
        begin
          present TD::Jobs::Offer.send(params[:id])
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'resends an offer'
      params do
        requires :id, type: Integer, desc: 'The id of the offer to be resent'
        optional :reason, type: String, desc: 'The reason to have resent the offer'
        optional :metadata, type: Hash, desc: "The offer's metadata"
      end
      put ':id/resend' do
        authorize! :tasker
        begin
          present TD::Jobs::Offer.resend(params[:id], params)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'withdraws an offer'
      params do
        requires :id, type: Integer, desc: 'The id of the offer to be withdrawn'
      end
      put ':id/withdraw' do
        authorize! :tasker
        begin
          present TD::Jobs::Offer.withdraw(params[:id])
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'returns an offer'
      params do
        requires :id, type: Integer, desc: 'The id of the offer to be returned'
        optional :reason, type: String, desc: 'The reason to have returned the offer'
      end
      put ':id/return' do
        authorize! :owner
        begin
          offer = TD::Jobs::Offer.return(params[:id], params)
          TaskFlexNotificator.delay.return_offer(offer)
          present offer
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'rejects an offer'
      params do
        requires :id, type: Integer, desc: 'The id of the offer to be rejected'
      end
      put ':id/reject' do
        authorize! :owner
        begin
          offer = TD::Jobs::Offer.reject(params[:id])
          TaskFlexNotificator.delay.reject_offer(offer)
          present offer
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'accepts an offer'
      params do
        requires :id, type: Integer, desc: 'The id of the offer to be accepted'
      end
      put ':id/accept' do
        authorize! :owner
        begin
          offer = TD::Jobs::Offer.accept(params[:id])
          TaskFlexNotificator.delay.accept_offer(offer)
          present offer
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets a list of current taskers with associated job'
      params do
        # owner id retrieved from the token in headers.
        optional :job_id, type: Integer, desc: 'If specified, only offers related to that job will'\
                                              'be retrieved'
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
        optional :status, type: String, desc: 'Status that the offer should meet'
      end
      get 'current/taskers' do
        authorize! :owner
        begin
          statuses = []
          if params[:status]
            statuses = params[:status].to_sym
            statuses = [:SENT, :RETURNED, :RESENT] if params[:status] == :PENDING.to_s
            statuses = [:ACCEPTED, :REJECTED, :SENT, :RETURNED, :RESENT] if params[:status] == ''
          end
          owner = current_user
          job_filter = { owner_id: owner.id, status: { in: [:ACTIVE, :CLOSED, :STARTED] } }
          job_filter[:id] = params[:job_id] if params[:job_id]
          offer_params = { status: statuses, job_filter: job_filter.to_json }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present OfferService.instance.taskers_by_offer_params(offer_params, page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets a list of past taskers with associated job'
      params do
        # owner id retrieved from the token in headers.
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get 'past/taskers' do
        authorize! :owner
        begin
          owner = current_user
          job_filter = { owner_id: owner.id, status: :FINISHED }
          offer_params = { status: :ACCEPTED, job_filter: job_filter.to_json }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present OfferService.instance.taskers_by_offer_params(offer_params, page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end
    end
  end
end
