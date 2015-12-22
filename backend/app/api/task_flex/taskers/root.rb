module TaskFlex
  module Taskers
    class Root < Grape::API

      before do
        # authorize! :tasker
      end

      ROLE_FILTER = { roles: { "$regex" => "(?i)tasker"} }

      desc 'gets all current tasker information'
      params do
        # provider_id is retrieved from header token
      end
      get 'me' do
        authorize! :tasker
        begin
          attrs = { id: current_user.id }
          user = UserService.instance.find_first(attrs.merge(ROLE_FILTER))
          unless user.nil?
            present user
          else error!("Tasker was not found", :not_found)
          end
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!("User was not found: '#{exception.message}'", :not_found)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets a tasker by its id'
      params do
        requires :id, type: String, desc: 'The id of the Tasker'
      end
      get ':id' do
        begin
          attrs = { id: params[:id] }
          tasker = UserService.instance.find_first(attrs.merge(ROLE_FILTER))
          unless tasker.nil?
            present tasker
          else error!("Tasker was not found", :not_found)
          end
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!("User was not found: '#{exception.message}'", :not_found)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'updates the current tasker with the given attributes'
      params do
        # provider_id is retrieved from header token.
        requires :first_name, type: String, desc: 'The tasker\'s first name'
        requires :last_name, type: String, desc: 'The tasker\'s last name'
        requires :metadata, desc: 'The tasker\'s metadata'
        optional :gender, type: String, desc: 'The tasker\'s gender'
        requires :email, type: String, desc: 'The tasker\'s email'
      end
      put do
        authorize! :tasker
        begin
          tasker = current_user
          present TD::Users::User.update(params.merge(id: tasker.id))
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'filters taskers by specific attributes'
      params do
        optional :first_name, type: String, desc: 'The first name of the Tasker'
        optional :last_name, type: String, desc: 'The last name of the Tasker'
        optional :and, type: Boolean, default: false,
                       desc: 'If filtering attributes by logic and or not'
      end
      get do
        begin
          attrs = {}
          attrs[:first_name] = { "$regex" => "(?i)#{params[:first_name]}" } if params[:first_name]
          attrs[:last_name] = { "$regex" => "(?i)#{params[:last_name]}" } if params[:last_name]
          unless params[:and]
            filters = []
            filters.push(first_name: attrs[:first_name]) if attrs[:first_name]
            filters.push(last_name: attrs[:last_name]) if attrs[:last_name]
            attrs = { "$or" => filters }
            attrs["$or"].push({}) if attrs["$or"].empty?
          end
          taskers = TD::Users::User.find(attrs.merge(ROLE_FILTER))
          taskers.map! { |tasker| UserService.instance.append_picture(tasker) }
          present taskers
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!("Server responsed with: #{exception.message}", :bad_request)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'returns the given job if the current tasker has an accepted offer related to it'
      params do
        requires :job_id, type: Integer, desc: "The id of the offer's job"
      end
      get 'job/:job_id' do
        authorize! :tasker
        begin
          tasker = current_user
          offer_params = { job_id: params[:job_id], status: :ACCEPTED, provider_id: tasker.id }
          offer = TD::Jobs::Offer.search(offer_params)
          if (offer.count < 1)
            raise TD::Jobs::EntityNotFound, "The given job could not be found or you don't have "\
                                            "accepted offers for it yet"
          else
            present offer.first.job
          end
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end
    end
  end
end
