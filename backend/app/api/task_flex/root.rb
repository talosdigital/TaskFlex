module TaskFlex
  class Root < Grape::API
    default_format :json

    helpers do
      def current_user
        if @user_token
          @current_user = TD::Users::User.current(@user_token) if @current_user.nil?
        else
          @current_user = TD::Users::User.current(headers['User-Token']) if @current_user.nil?
        end
        @current_user
      end

      def user_roles
        begin
          # 'current' method will return an Auth object, which has the 'roles' method to get an
          # array of all user roles. We convert each role to downcase and symbol.
          return current_user.roles.map do |role|
            role.downcase.to_sym
          end
        rescue TD::Users::AuthFailed, TD::Users::GenericError, TD::Users::InvalidParam
          return []
        end
      end

      def authorize!(*roles)
        # Intersecting both arrays, if the resulting array is empty means that none of the User
        # roles are authorized.
        if (user_roles & roles).empty?
          error!("You are not authorized to do this operation.", :unauthorized)
        end
      end
    end

    mount Jobs::Root => '/jobs'
    mount Invitations::Root => '/invitations'
    mount Offers::Root => '/offers'
    mount Taskers::Root => '/taskers'
    mount Owners::Root => '/owners'
    mount Auths::Root => '/auths'
    mount Categories::Root => '/categories'
  end
end
