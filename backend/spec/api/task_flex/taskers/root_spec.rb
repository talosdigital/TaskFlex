require 'rails_helper'
require 'faker'

RSpec.describe TaskFlex::Taskers::Root do
  before :all do
    @headers = { 'Content-Type' => 'application/json', 'Accept' => 'application/json' }
    # A dirty way to stub the helper.
    TaskFlex::Root.helpers do
      def authorize!(*roles)
        nil
      end

      def current_user
        TD::Users::User.new id: 'a'
      end
    end
  end

  before :each do
    @tasker = TD::Users::User.new(id: Faker::Lorem.word, first_name: Faker::Name.first_name,
                                  last_name: Faker::Name.last_name, gender: "female",
                                  addresses: [], contacts: [], roles: ["tasker"],
                                  updated_at: '2015-08-11T13:42:35.533Z',
                                  created_at: '2015-08-11T13:42:35.533Z')
  end

  describe 'GET /invitations/tasker' do
    let(:job) { TD::Jobs::Job.new(owner_id: 1) }
    let(:invitation) { TD::Jobs::Invitation.new(job: job) }
    let(:owner) { TD::Users::User.new }
    context 'when server responds correctly with invitations' do
      it 'returns 200 with the invitations' do
        expect(TD::Jobs::Invitation).to receive(:paginated_search)
          .and_return({'invitations' => [invitation, invitation]})
        allow(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_return([owner])
        get "/invitations/tasker", {}, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Invitation).to receive(:paginated_search)
          .and_raise(TD::Jobs::WrongAttributes)
        get "/invitations/tasker", {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /taskers/:id' do
    context 'when server responds with the tasker' do
      it 'returns the tasker' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([@tasker])
        get '/taskers/1', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq @tasker.to_json
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        get '/taskers/1', {}, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 404' do
        expect(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        get '/taskers/1', {}, @headers
        expect(response.status).to eq 404
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        get '/taskers/1', {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'PUT /taskers/' do
    let(:params) do
      { first_name: Faker::Lorem.word, last_name: Faker::Lorem.word, metadata: {},
        email: Faker::Internet.email }
    end
    context 'when server responds with the updated tasker' do
      it 'returns the updated tasker' do
        expect(TD::Users::User).to receive(:update)
          .with(kind_of Hash)
          .and_return(@tasker)
        put '/taskers', params.to_json, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq @tasker.to_json
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::User).to receive(:update)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        put '/taskers', params.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:update)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        put '/taskers', params.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 401' do
        expect(TD::Users::User).to receive(:update)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        put '/taskers', params.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /taskers' do
    context 'when server responds with all taskers' do
      it 'returns an array with taskers' do
        expect(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_return([@tasker, @tasker, @tasker])
        get '/taskers', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq [@tasker, @tasker, @tasker].to_json
      end
    end

    context 'when server responds with no taskers' do
      it 'returns an empty array' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        get '/taskers', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq [].to_json
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        get '/taskers', {}, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        get '/taskers', {}, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        get '/taskers', {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET job/:job_id' do
    let(:job) { TD::Jobs::Job.new }
    let(:offer) { TD::Jobs::Offer.new(job: job) }
    context 'when server responds with an offer containing the job' do
      it 'returns the offer job' do
        expect(TD::Jobs::Offer).to receive(:search).and_return([offer])
        get '/taskers/job/1', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq job.to_json
      end
    end

    context 'when server responds with no offers' do
      it 'returns 404' do
        expect(TD::Jobs::Offer).to receive(:search).and_return([])
        get '/taskers/job/1', {}, @headers
        expect(response.status).to eq 404
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Offer).to receive(:search).and_raise(TD::Jobs::WrongAttributes)
        get '/taskers/job/1', {}, @headers
        expect(response.status).to eq 400
      end
    end
  end
end
