require 'ci/reporter/rake/rspec'

# Report for tests ran with 'bundle exec rake ci:setup:rspec spec'
# will be generated in the following path:
ENV['CI_REPORTS'] = Rails.root.parent.join('reports', 'backend').to_path
