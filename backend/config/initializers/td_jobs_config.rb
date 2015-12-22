TD::Jobs.configure do |config|
  if Rails.env.production?
    config.application_secret = ENV['TDJOBS_SECRET']
    config.base_url           = "#{ENV['TDJOBS_URL'] || 'localhost'}/api/v1"
  else
    config.application_secret = "ah15Af6130kgoa5sD1yUQioaP"
    config.base_url           = "http://localhost:3000/api/v1"
  end
end
