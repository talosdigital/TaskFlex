FROM rails:onbuild

# Set up working directory
RUN mkdir /taskflex
WORKDIR /taskflex

# Set up gems
ADD Gemfile /taskflex/Gemfile
ADD Gemfile.lock /taskflex/Gemfile.lock

# Set up environment variables
ENV RAILS_ENV production
ENV TASKFLEX_BACK_END_PORT 3001

# Install dependencies
RUN bundle install

# Finally, add the rest of our app's code
# (this is done at the end so that changes to our app's code
# don't bust Docker's cache)
ADD . /taskflex

# SOURCE:
#   https://allenan.com/docker-rails-dev-environment-for-osx/
