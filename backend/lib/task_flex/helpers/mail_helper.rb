module MailHelper
  def self.url_for(path, params={})
    query = ""
    params.each do |key, value|
      if query.empty? then query = "?#{key}=#{value}"
      else query += "&#{key}=#{value}"
      end
    end
    "#{TaskFlex.configuration.email_options[:href_url]}#{path}#{query}"
  end

  def self.user_email(user_id)
    user = UserHelper.basic_info_for(user_id)
    user.nil? ? nil : user[:email]
  end
end
