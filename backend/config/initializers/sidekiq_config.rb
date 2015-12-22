# These environment variables are being retrieved from
# docker compose. As we're linking sidekiq container with
# redis one they will share some variables.
# Run 'docker-compose run tf_redis env' to check what values are
redis_domain = ENV['TF_REDIS_1_PORT_6379_TCP_ADDR']
redis_port   = ENV['TF_REDIS_1_PORT_6379_TCP_PORT']

if redis_domain && redis_port
  redis_url = "redis://#{redis_domain}:#{redis_port}"

  Sidekiq.configure_server do |config|
    config.redis = {
      namespace: "sidekiq",
      url: redis_url
    }
  end

  Sidekiq.configure_client do |config|
    config.redis = {
      namespace: "sidekiq",
      url: redis_url
    }
  end
end
