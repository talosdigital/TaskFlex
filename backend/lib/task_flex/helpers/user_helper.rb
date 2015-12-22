module UserHelper
  def self.basic_info_for(user_id)
    begin
      users_found = TD::Users::User.find(id: user_id)
    rescue TD::Users::ValidationError => exception
      users_found = []
    end
    if users_found.is_a?(Array)
      unless users_found.empty?
        user = users_found.first
        user.metadata = {} unless user.metadata
        hash = user.email ? Digest::MD5.hexdigest(user.email.downcase) : ""
        image_src = "http://www.gravatar.com/avatar/#{hash}?d=mm"
        user.metadata[:picture] = image_src
        return user.to_hash_without_nils.slice(:id, :email, :first_name, :last_name, :metadata)
      end
    end
    nil
  end
end
