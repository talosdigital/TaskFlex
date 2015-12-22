module TaskFlex
  module Auths
    class Root < Grape::API

      desc 'creates and authenticates a user'
      params do
        requires :email, type: String, desc: 'The email of the user'
        requires :password, type: String, desc: 'The password of the user'
        requires :first_name, type: String, desc: 'The first name of the user'
        requires :last_name, type: String, desc: 'The last name of the user'
        requires :birth_date, type: Date, desc: 'The birth date of the user'
        requires :gender, type: String, desc: 'The gender of the user'
        optional :height, type: Integer, desc: 'The height of the user'
        optional :weight, type: Integer, desc: 'The weight of the user'
        optional :roles, type: Array, desc: 'The roles of the user'
        optional :remember_me, type: Boolean, desc: 'If the user wants to be remembered',
                               default: false
      end
      post do
        begin
          existing_user = TD::Users::User.find(email: params[:email])
          error!("Email already in use", :bad_request) unless existing_user.empty?
          created_user = UserService.instance.create(params.except(:email, :password, :remember_me))
          attrs = { user_id: created_user.id, email: params[:email], password: params[:password],
                    remember_me: params[:remember_me] }
          present UserService.instance.authenticate(created_user, attrs)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!("Validation error: '#{exception.message}'", :bad_request)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'creates and authenticates a tasker'
      params do
        requires :email, type: String, desc: 'The email of the tasker'
        requires :password, type: String, desc: 'The password of the tasker'
        requires :first_name, type: String, desc: 'The first name of the tasker'
        requires :last_name, type: String, desc: 'The last name of the tasker'
        requires :birth_date, type: Date, desc: 'The birth date of the tasker'
        requires :gender, type: String, desc: 'The gender of the tasker'
        optional :height, type: Integer, desc: 'The height of the tasker'
        optional :weight, type: Integer, desc: 'The weight of the tasker'
        optional :remember_me, type: Boolean, desc: 'If the tasker wants to be remembered',
                               default: false
      end
      post '/tasker' do
        begin
          existing_user = TD::Users::User.find(email: params[:email])
          error!("Email already in use", :bad_request) unless existing_user.empty?
          create_attrs = params.except(:email, :password, :remember_me)
          create_attrs.merge!(roles: [:tasker])
          created_tasker = UserService.instance.create(create_attrs)
          attrs = { user_id: created_tasker.id, email: params[:email], password: params[:password],
                    remember_me: params[:remember_me] }
          present UserService.instance.authenticate(created_tasker, attrs)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!("Validation error: '#{exception.message}'", :bad_request)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'creates and authenticates an owner'
      params do
        requires :email, type: String, desc: 'The email of the owner'
        requires :password, type: String, desc: 'The password of the owner'
        requires :first_name, type: String, desc: 'The first name of the owner'
        requires :last_name, type: String, desc: 'The last name of the owner'
        requires :birth_date, type: Date, desc: 'The birth date of the owner'
        requires :gender, type: String, desc: 'The gender of the owner'
        optional :height, type: Integer, desc: 'The height of the owner'
        optional :weight, type: Integer, desc: 'The weight of the owner'
        optional :remember_me, type: Boolean, desc: 'If the owner wants to be remembered',
                               default: false
      end
      post '/owner' do
        begin
          existing_user = TD::Users::User.find(email: params[:email])
          error!("Email already in use", :bad_request) unless existing_user.empty?
          create_attrs = params.except(:email, :password, :remember_me)
          create_attrs.merge!(roles: [:owner])
          created_owner = UserService.instance.create(create_attrs)
          attrs = { user_id: created_owner.id, email: params[:email], password: params[:password],
                    remember_me: params[:remember_me] }
          present UserService.instance.authenticate(created_owner, attrs)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!("Validation error: '#{exception.message}'", :bad_request)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'logs in, creating an authentication for the user'
      params do
        requires :email, type: String, desc: 'The email of the user'
        requires :password, type: String, desc: 'The password of the user'
        optional :remember_me, type: Boolean, desc: 'If the user wants to be remembered',
                               default: false
      end
      post '/login' do
        begin
          present TD::Users::Auth.log_in(params)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::ValidationError => exception
          error!("Validation error: '#{exception.message}'", :bad_request)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'logs in an user using a Facebook token'
      params do
        requires :token, type: String, desc: 'The Facebook token of the user'
        optional :role, type: String, desc: 'The role to be created in case of new user'
      end
      post '/facebook' do
        begin
          auth = TD::Users::Auth.facebook(params[:token])
          @user_token = auth.token
          unless (user_roles.include?(:owner) || user_roles.include?(:tasker))
            user_attrs = current_user.to_hash_without_nils
            user_attrs[:roles] = [] if user_attrs[:roles].nil?
            old_roles = user_attrs[:roles]
            user_attrs[:roles] = [params[:role]]
            user_attrs[:roles].push(*old_roles)
            TD::Users::User.update user_attrs
          end
          auth
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'logs out an user'
      delete '/logout' do
        begin
          present success: TD::Users::Auth.log_out(current_user.id)
        rescue TD::Users::AuthFailed, TD::Users::InvalidParam
          # If the User-Token is invalid, we don't care and return that we logged out.
          present success: true
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'updates the user password'
      params do
        requires :current_password, type: String, desc: 'The current user password'
        requires :new_password, type: String, desc: 'The new password for the user'
      end
      put '/update_password' do
        begin
          attrs_to_send = params
          attrs_to_send.merge!(user_id: current_user.id)
          present success: TD::Users::Auth.update_password(attrs_to_send)
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'gets the information of the current user'
      get '/current' do
        begin
          present UserService.instance.append_picture(current_user)
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::InvalidParam => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'sends an email to recover the password to the given email address'
      params do
        requires :email, type: String, desc: "The email address of the user who forgot his password"
      end
      post '/reset_password/request' do
        begin
          auth = TD::Users::Auth.reset_password_request(params[:email])
          TaskFlexNotificator.delay.reset_password_request(auth)
          present success: true
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end

      desc 'sets a new password to a user according to the given token'
      params do
        requires :password, type: String, desc: "The new user password"
        requires :verify_token, type: String, desc: "The token specified in the email sent"
      end
      put '/reset_password' do
        begin
          present success: TD::Users::Auth.reset_password(params)
        rescue TD::Users::ValidationError => exception
          error!(exception.message, :bad_request)
        rescue TD::Users::AuthFailed => exception
          error!(exception.message, :unauthorized)
        rescue TD::Users::GenericError => exception
          error!(exception.message, :bad_request)
        end
      end
    end
  end
end
