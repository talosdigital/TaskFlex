module TaskFlex
  module Invitations
    class Root < Grape::API

      desc 'gets all current tasker invitations, including owner information'
      params do
        # provider_id is retrieved from header token.
        optional :page, type: Integer, desc: 'The page of results to be shown'
        optional :per_page, type: Integer, desc: 'Items per page to be shown in the results'
      end
      get 'tasker' do
        authorize! :tasker
        begin
          tasker = current_user
          invitation_params = { provider_id: tasker.id, status: :SENT }
          page = params[:page]
          per_page = params[:per_page] ? params[:per_page] : TaskFlex.configuration.items_per_page
          response = TD::Jobs::Invitation.paginated_search(invitation_params, page, per_page)
          result = []
          response['invitations'].each do |invitation|
            invitation_with_owner = InvitationService.instance.append_owner(invitation,
                                                                            :email, :first_name,
                                                                            :last_name)
            result.push(invitation_with_owner) unless invitation_with_owner.nil?
          end
          response['invitations'] = result
          present response
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets an invitation by id, including the owner information'
      params do
        requires :id, type: Integer, desc: 'The id of the Invitation'
      end
      get ':id' do
        authorize! :tasker, :owner
        begin
          invitation = TD::Jobs::Invitation.find(params[:id])
          invitation = InvitationService.instance.append_owner(invitation)
          owner = UserService.instance.append_picture(invitation[:owner])
          invitation[:owner] = owner.to_hash_without_nils.slice(:id, :first_name, :last_name)
          invitation[:owner][:metadata] = { picture: owner.metadata[:picture] }
          present invitation
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      desc 'searches for invitations'
      params do
        optional :provider_id, type: String, desc: "The id of the invitation's provider"
        optional :job_id, type: Integer, desc: "The id of the invitation's job"
        optional :status, type: Array[String], desc: "The invitation's status"
        optional :created_at_from, type: Date, desc: "The start of the range for the invitation's date"
        optional :created_at_to, type: Date, desc: "The end of the range for the invitation's date"
      end
      get do
        authorize! :tasker, :owner
        present TD::Jobs::Invitation.search(params)
      end

      desc 'creates a new invitation'
      params do
        requires :provider_id, type: String, desc: "The id of the invitation's provider"
        requires :job_id, type: Integer, desc: "The id of the invitation's job"
        optional :description, type: String, desc: "The invitation's description"
      end
      post do
        authorize! :owner
        begin
          present TD::Jobs::Invitation.create(params)
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      desc 'creates a new invitation and immediatly sends it'
      params do
        requires :provider_id, type: String, desc: "The id of the invitation's provider"
        requires :job_id, type: Integer, desc: "The id of the invitation's job"
        optional :description, type: String, desc: "The invitation's description"
      end
      post 'send' do
        authorize! :owner
        begin
          invitation = TD::Jobs::Invitation.create(params)
          invitation.send
          TaskFlexNotificator.delay.invite_tasker(invitation)
          present invitation
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      desc 'sends an invitation'
      params do
        requires :id, type: Integer, desc: 'The id of the invitation to be sent'
      end
      put ':id/send' do
        authorize! :owner
        begin
          invitation = TD::Jobs::Invitation.send(params[:id])
          TaskFlexNotificator.delay.invite_tasker(invitation)
          present invitation
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      desc 'withdraws an invitation'
      params do
        requires :id, type: Integer, desc: 'The id of the invitation to be withdrawn'
      end
      put '/:id/withdraw' do
        authorize! :owner
        begin
          present TD::Jobs::Invitation.withdraw(params[:id])
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      desc 'accepts an invitation'
      params do
        requires :id, type: Integer, desc: 'The id of the invitation to be accepted'
      end
      put '/:id/accept' do
        authorize! :tasker
        begin
          present TD::Jobs::Invitation.accept(params[:id])
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end

      desc 'rejects an invitation'
      params do
        requires :id, type: Integer, desc: 'The id of the invitation to be rejected'
      end
      put '/:id/reject' do
        authorize! :tasker
        begin
          invitation = TD::Jobs::Invitation.reject(params[:id])
          TaskFlexNotificator.delay.reject_invitation(invitation)
          present invitation
        rescue TD::Jobs::InvalidStatus => exception
          error!(exception.message, :bad_request)
        rescue TD::Jobs::EntityNotFound => exception
          error!(exception.message, :not_found)
        end
      end
    end
  end
end
