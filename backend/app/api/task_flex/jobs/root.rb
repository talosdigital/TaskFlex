module TaskFlex
  module Jobs
    # Contains endpoint methods for Jobs, hits service methods. See grape-swagger documentation.
    class Root < Grape::API
      params do
        requires :query, desc: 'The attributes that should the job meet'
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get 'search' do
        authorize! :tasker, :owner
        begin
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present TD::Jobs::Job.paginated_search(params[:query], page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets active jobs to be seen by taskers (doesn\'t include private)'
      params do
        requires :query, desc: 'The attributes that should the active job meet'
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get 'active' do
        begin
          new_params = JSON.parse(params[:query])
          new_params[:status] = :ACTIVE
          new_params[:invitation_only] = "false"
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present TD::Jobs::Job.paginated_search(new_params.to_json, page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue JSON::JSONError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets all jobs that a specific owner can invite to work on (includes private)'
      params do
        # owner_id is retrieved from user header token.
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get 'all/owner' do
        authorize! :owner
        begin
          new_params = {}
          new_params[:status] = :ACTIVE
          new_params[:owner_id] = current_user.id
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present TD::Jobs::Job.paginated_search(new_params.to_json, page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue JSON::JSONError => exception
          error!(exception.message, :bad_request)
        end
      end

      params do
        requires :id, type: Integer, desc: 'The id of the job'
      end
      get ':id' do
        # authorize! :tasker, :owner
        begin
          present TD::Jobs::Job.find(params[:id])
        rescue TD::Jobs::EntityNotFound => exception
           error!(exception.message, :not_found)
        end
      end

      desc 'creates a job'
      params do
        requires :name, type: String, desc: "The job's name"
        requires :description, type: String, desc: "The job's description"
        requires :due_date, type: Date, desc: "The job's due date"
        requires :start_date, type: Date, desc: "The job's start date"
        requires :finish_date, type: Date, desc: "The job's finish date"
        optional :invitation_only, type: Boolean,
                                   desc: 'Whether the Job recieve offers only by invitation'
        optional :metadata, type: Hash, desc: "The job's metadata"
        optional :activate, type: Boolean, desc: 'Whether to activate the job once created or not',
                            default: true
      end
      post do
        authorize! :owner
        begin
          attrs_to_send = params
          attrs_to_send.merge!(owner_id: current_user.id)
          if params[:activate] then present JobService.instance.create_and_activate(attrs_to_send)
          else present JobService.instance.create(attrs_to_send)
          end
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::WrongAttributes => exception
           error!(exception.message, :bad_request)
        end
      end

      desc 'creates a job, activates it, creates and send an invitation for that job'
      params do
        requires :name, type: String, desc: "The job's name"
        requires :description, type: String, desc: "The job's description"
        requires :due_date, type: Date, desc: "The job's due date"
        requires :start_date, type: Date, desc: "The job's start date"
        requires :finish_date, type: Date, desc: "The job's finish date"
        optional :invitation_only, type: Boolean,
                                   desc: 'Whether the Job recieve offers only by invitation'
        optional :metadata, type: Hash, desc: "The job's metadata"
        requires :invitation, type: Hash do
          requires :provider_id, type: String, desc: "The id of the invitation's provider"
          optional :description, type: String, desc: "The invitation's description"
        end
      end
      post 'invite' do
        authorize! :owner
        begin
          attrs_to_send = params
          attrs_to_send.merge!(owner_id: current_user.id)
          job = JobService.instance.create_and_activate(attrs_to_send)
          invitation_params = params[:invitation].merge(job_id: job.id)
          present InvitationService.instance.create_and_send(invitation_params)
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      params do
        requires :id, type: Integer, desc: 'The id of the job to be updated'
        optional :description, type: String, desc: "The new job's description"
        optional :name, type: String, desc: "The new job's name"
        optional :due_date, type: Date, desc: "The new job's due date"
        optional :invitation_only, type: Boolean,
                                   desc: 'Whether the Job recieve offers only by invitation'
        optional :metadata, type: Hash, desc: "The new job's metadata"
      end
      put ':id' do
        authorize! :owner
        update_params = {}
        update_params[:description] = params[:description] if params[:description]
        update_params[:name] = params[:name] if params[:name]
        update_params[:start_date] = params[:start_date] if params[:start_date]
        update_params[:finish_date] = params[:finish_date] if params[:finish_date]
        update_params[:due_date] = params[:due_date] if params[:due_date]
        update_params[:invitation_only] = params[:invitation_only] unless params[:invitation_only].nil?
        update_params[:metadata] = params[:metadata] if params[:metadata]
        begin
          present TD::Jobs::Job.update(params[:id], update_params)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
           error!(exception.message, :not_found)
        end
      end

      params do
        requires :id, type: Integer, desc: 'The id of the job to be deactivated'
      end
      put ':id/deactivate' do
        authorize! :owner
        begin
          present TD::Jobs::Job.deactivate(params[:id])
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      params do
        requires :id, type: Integer, desc: 'The id of the job to be activated'
      end
      put ':id/activate' do
        authorize! :owner
        begin
          present TD::Jobs::Job.activate(params[:id])
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      params do
        requires :id, type: Integer, desc: 'The id of the job to be closed'
      end
      put ':id/close' do
        authorize! :owner
        begin
          present TD::Jobs::Job.close(params[:id])
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      desc 'gets all tasker current jobs'
      params do
        # provider id retrieved from the token in headers.
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get '/current/tasker' do
        authorize! :tasker
        begin
          tasker = current_user
          job_filter = { status: { in: [:ACTIVE, :CLOSED, :STARTED] } }
          offer_params = { provider_id: tasker.id, status: :ACCEPTED,
                           job_filter: job_filter.to_json }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          response = TD::Jobs::Offer.paginated_search(offer_params, page, per_page)
          response['offers'].map! { |offer| offer.job }
          response['jobs'] = response['offers']
          response.delete('offers')
          present response
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets all tasker past jobs'
      params do
        # provider id retrieved from the token in headers.
      end
      get '/past/tasker' do
        authorize! :tasker
        begin
          tasker = current_user
          job_filter = { status: :FINISHED }
          offer_params = { provider_id: tasker.id, status: :ACCEPTED,
                           job_filter: job_filter.to_json }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          response = TD::Jobs::Offer.paginated_search(offer_params, page, per_page)
          response['offers'].map! { |offer| offer.job }
          response['jobs'] = response['offers']
          response.delete('offers')
          present response
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets all owner current jobs'
      params do
        # owner id retrieved from the token in headers.
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get '/current/owner' do
        authorize! :owner
        begin
          owner = current_user
          job_filter = { owner_id: owner.id, status: { in: [:ACTIVE, :CLOSED, :STARTED] } }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present TD::Jobs::Job.paginated_search(job_filter.to_json, page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets all owner past jobs'
      params do
        # owner id retrieved from the token in headers.
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get '/past/owner' do
        authorize! :owner
        begin
          owner = current_user
          job_filter = { owner_id: owner.id, status: :FINISHED }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          present TD::Jobs::Job.paginated_search(job_filter.to_json, page, per_page)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end
    end
  end
end
