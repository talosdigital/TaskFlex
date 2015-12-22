module TaskFlex
  # For a block { |config| ... }
  # @yield [config] passes the Configuration object.
  # @yieldparam config the Configuration object to be configured.
  # @see Configuration
  # @example Configure Task Flex
  #   TaskFlex.configure do |config|
  #     config.categories = []
  #   end
  def self.configure
    yield Configuration.instance if block_given?
  end

  # @return the current Configuration.
  def self.configuration
    Configuration.instance
  end

  # Contains all configuration options and accessors.
  class Configuration
    include Singleton

    # The configuration options array. It's used to generate all the writers.
    CONFIG_OPTIONS = [:categories, :items_per_page, :email_options]

    attr_writer(*CONFIG_OPTIONS)

    # Defaults to empty array
    # @return [String] the application secret which allows other applications to make requests.
    def categories
      @categories = [] if @categories.nil?
      @categories
    end

    # Defaults to nil
    # @return [Integer] the number of items per page to be shown in each page.
    def items_per_page
      @items_per_page
    end

    # Defaults to empty hash
    # @return [Hash] the email service configuration
    def email_options
      @email_options = {} if @email_options.nil?
      @email_options
    end
  end
end
