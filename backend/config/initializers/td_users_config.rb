TD::Users.configure do |config|
  if Rails.env.production?
    config.application_secret = ENV['TDUSERS_SECRET']
    config.base_url           = ENV['TDUSERS_URL'] || 'localhost'
  else
    config.application_secret = 'TDUserToken-CHANGE-ME!'
    config.base_url           = 'http://localhost:9001'
  end
  config.user_url = '/api/v1/user'
  config.auth_url = '/api/v1/auth'
end
