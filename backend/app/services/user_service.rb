class UserService
  include Singleton

  # Creates an user with the given attributes.
  # @param attrs [Hash] Attributes that the user will be created with.
  # @raise [TD::Users::ValidationError] If there was an error while trying to create the user.
  # @return [TD::Users::User] The user created.
  def create(attrs)
    created_user = TD::Users::User.create(attrs)
  end

  # Authenticates an already created user and merges the authentication information in the given
  #   user instance. Notice that the id of the user to be authenticated will be taken from :attrs,
  #   not from :created_user.
  # @param created_user [TD::Users::User] Instance of already created user for merging the auth
  #   information there.
  # @param attrs [Hash] Information to authenticate the user.
  # @option attrs [String] :user_id User of the id to be authenticated.
  # @option attrs [String] :email Email to authenticate the user.
  # @option attrs [String] :password Password to authenticate the user.
  # @option attrs [Boolean] :remember_me Whether to remember the user or not.
  # @raise [TD::Users::AuthFailed] If there was an error while trying to authenticate the user with
  #   the given information.
  # @return [TD::Users::User] The user authenticated.
  def authenticate(created_user, attrs)
    authentication = TD::Users::Auth.sign_up(attrs)
    created_user.email = authentication.email
    created_user.auth = authentication
    TaskFlexNotificator.delay.welcome_user(created_user)
    created_user
  end

  # Appends the profile picture corresponding to the given user in the metadata field.
  # @param user [Hash or TD::Users::User] the user information. If it is a Hash it will be converted
  # @return [TD::Users::User] the user with the picture information in the metadata field.
  def append_picture(user)
    return if user.nil?
    user = TD::Users::User.new(user) if user.is_a?(Hash)
    user.metadata = {} unless user.metadata
    hash = user.email ? Digest::MD5.hexdigest(user.email.downcase) : ""
    image_src = "http://www.gravatar.com/avatar/#{hash}?d=mm"
    user.metadata[:picture] = image_src
    user
  end

  # Retrieves the required attributes from a user and returns them
  # @param id [String] the id of the user to retrieve.
  # @param user_attrs [Symbol] one or more attributes that are to be included in the user info.
  #   NOTE: If no :user_attrs were given, ALL the user information will be returned.
  # @return [Hash] A hash contaning the requested information about the user.
  def user_information(id, *user_attrs)
    begin
      user_found = TD::Users::User.find(id: id)
    rescue TD::Users::ValidationError
      nil
    end
    if user_found.is_a?(Array) && !user_found.empty?
      user = user_found.first.to_hash_without_nils
      user.slice!(*user_attrs) if user_attrs.any?
      return user
    end
    nil
  end

  # Fetches the first user that meets the given requirements in :attrs. Always includes the picture.
  # @param attrs [Hash] Attributes that the user should meet.
  # @return [TD::Users::User] The user meeting the given requirements and with the picture in
  #   the metadata field.
  def find_first(attrs)
    user = TD::Users::User.find(attrs)
    if user.is_a?(Array) && !user.empty?
      return UserService.instance.append_picture(user.first)
    end
    nil
  end
end
