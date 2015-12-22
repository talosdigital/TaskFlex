# Load the Rails application.
require File.expand_path('../application', __FILE__)

# Load defined environment variables in config/environment_variables.rb file
env_variables = File.join(Rails.root, 'config', 'environment_variables.rb')
require env_variables if File.exists?(env_variables)

# Initialize the Rails application.
Rails.application.initialize!
