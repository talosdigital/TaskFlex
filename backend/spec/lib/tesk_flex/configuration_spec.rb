require 'rails_helper'

describe TaskFlex do
  it 'responds to :configuration' do
    expect(TaskFlex).to respond_to :configuration
  end

  it 'responds to :configure' do
    expect(TaskFlex).to respond_to :configure
  end

  describe '.configure' do
    it 'sets the configuration from within a block' do
      category = { name: "Cat1", keyword: "cat1", image: "image.png" }
      TaskFlex.configure do |config|
        config.categories = [ category ]
      end
      expect(TaskFlex.configuration.categories.first).to eq category
    end
  end
end

describe TaskFlex::Configuration do
  it 'responds to :categories' do
    expect(TaskFlex.configuration).to respond_to :categories=
    expect(TaskFlex.configuration).to respond_to :categories
  end

  context 'when options have default values' do
    it 'returns an empty array for :categories' do
      TaskFlex.configuration.categories = nil # Supposing that was not initialized.
      expect(TaskFlex.configuration.categories).to eq []
    end
  end
end
