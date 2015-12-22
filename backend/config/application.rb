require File.expand_path('../boot', __FILE__)

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
# require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
# require "sprockets/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module TaskFlex
  class Application < Rails::Application
    config.paths.add File.join('app', 'api'), glob: File.join('**', '*.rb')
    config.autoload_paths += Dir[Rails.root.join('app', 'api', '*')]
    config.middleware.use Rack::Cors do
      allow do
        origins '*'
        resource '/*', headers: :any, methods: [:get, :post, :options, :put, :delete]
      end
    end
    config.generators do |g|
      g.test_framework :rspec, fixtures: false,
                               helper_specs: false,
                               routing_specs: false,
                               controller_specs: true,
                               request_specs: false
    end
  end
end
