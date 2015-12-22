Rails.application.configure do
  config.roadie.url_options = {
    scheme: TaskFlex.configuration.email_options[:images_url][:scheme],
    host: TaskFlex.configuration.email_options[:images_url][:host],
    port: TaskFlex.configuration.email_options[:images_url][:port],
    path: TaskFlex.configuration.email_options[:images_url][:path]
  }
  config.action_mailer.default_url_options = {
    host: TaskFlex.configuration.email_options[:host]
  }

  unless ENV['RAILS_ENV'] == 'production'
    # Do not raise errors if we are on production.
    config.action_mailer.raise_delivery_errors = true
  end

  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    address: TaskFlex.configuration.email_options[:address],
    port: TaskFlex.configuration.email_options[:port],
    domain: TaskFlex.configuration.email_options[:domain],
    authentication: "plain",
    enable_starttls_auto: true,
    user_name: TaskFlex.configuration.email_options[:user_name],
    password: TaskFlex.configuration.email_options[:password]
  }
end
