require 'rails_helper'
require 'faker'

RSpec.describe TaskFlex::Categories::Root do
  before :all do
    @headers = { 'Content-Type' => 'application/json', 'Accept' => 'application/json' }
  end

  before :each do
    @category = { name: "Design & Arts", keyword: "design", image: "arts.png" }
  end

  describe 'GET /categories' do
    context 'when there are many categories configured' do
      it 'returns those categories' do
        expect(TaskFlex.configuration).to receive(:categories).and_return([@category, @category])
        get '/categories', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq [@category, @category].to_json
      end
    end

    context 'when there is no category in configuration' do
      it 'returns an empty array' do
        expect(TaskFlex.configuration).to receive(:categories).and_return([])
        get '/categories', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq [].to_json
      end
    end
  end

  describe 'GET /categories/:keyword' do
    context 'when the category is found' do
      it 'returns the found category' do
        expect(TaskFlex.configuration).to receive(:categories).and_return([@category])
        get "/categories/#{@category[:keyword]}", {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq @category.to_json
      end
    end

    context 'when the category is not found' do
      it 'raises a 404' do
        expect(TaskFlex.configuration).to receive(:categories).and_return([@category])
        get "/categories/#{@category[:keyword] + 'a'}", {}, @headers
        expect(response.status).to eq 404
      end
    end
  end
end
