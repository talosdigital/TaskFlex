require 'rails_helper'
require 'faker'

RSpec.describe TaskFlex::Jobs::Root do
  before :all do
    @headers = { 'Content-Type' => 'application/json', 'Accept' => 'application/json' }
    # A dirty way to stub the helper
    TaskFlex::Root.helpers do
      def authorize!(*roles)
        nil
      end

      def current_user
        TD::Users::User.new(id: 'a')
      end
    end
  end

  before :each do
    @job = TD::Jobs::Job.new(id: 1, name: Faker::Lorem.word, description: Faker::Lorem.sentence,
                             owner_id: Faker::Number.number(2).to_i, status: :CREATED,
                             due_date: Faker::Date.between(2.days.since, 5.days.since),
                             start_date: Faker::Date.between(5.days.since, 10.days.since),
                             finish_date: Faker::Date.between(10.days.since, 15.days.since),
                             created_at: Faker::Date.between(5.days.ago, 2.days.since),
                             updated_at: Faker::Date.between(2.days.since, 1.days.since),
                             metadata: {}, invitation_only: true)
    @invitation = TD::Jobs::Invitation.new(provider_id: Faker::Lorem.word,
                                           description: Faker::Lorem.sentence)
  end

  describe 'GET /jobs/search' do
    context 'when server responds with many jobs' do
      it 'returns those jobs' do
        expect(TD::Jobs::Job).to receive(:paginated_search).and_return([@job, @job, @job])
        get "/jobs/search?query=#{URI.encode("{}")}", {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq [@job, @job, @job].to_json
      end
    end

    context 'when server responds with no jobs' do
      it 'returns an empty array' do
        expect(TD::Jobs::Job).to receive(:paginated_search).and_return([])
        get "/jobs/search?query=#{URI.encode("{}")}", {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq [].to_json
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:paginated_search).and_raise(TD::Jobs::WrongAttributes)
        get "/jobs/search?query=#{URI.encode("{}")}", {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /jobs/active' do
    context 'when server responds with many jobs' do
      it 'returns those jobs' do
        expect(TD::Jobs::Job).to receive(:paginated_search)
          .and_return({ jobs: [@job, @job, @job] })
        get "/jobs/active?page=2&query=#{URI.encode("{}")}", {}, @headers
        parsed = JSON.parse(response.body)
        expect(response.status).to eq 200
        expect(parsed['jobs'].to_json).to eq [@job, @job, @job].to_json
      end
    end

    context 'when server responds with no jobs' do
      it 'returns an empty array' do
        expect(TD::Jobs::Job).to receive(:paginated_search).and_return({ jobs: [] })
        get "/jobs/active?page=2&query=#{URI.encode("{}")}", {}, @headers
        parsed = JSON.parse(response.body)
        expect(response.status).to eq 200
        expect(parsed['jobs'].to_json).to eq [].to_json
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:paginated_search)
          .and_raise(TD::Jobs::WrongAttributes)
        get "/jobs/active?page=2&query=#{URI.encode("{}")}", {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /jobs/all/owner' do
    context 'when server responds with many jobs' do
      it 'returns those jobs' do
        expect(TD::Jobs::Job).to receive(:paginated_search)
          .and_return({ jobs: [@job, @job, @job] })
        get "/jobs/all/owner?page=2", {}, @headers
        parsed = JSON.parse(response.body)
        expect(response.status).to eq 200
        expect(parsed['jobs'].to_json).to eq [@job, @job, @job].to_json
      end
    end

    context 'when server responds with no jobs' do
      it 'returns an empty array' do
        expect(TD::Jobs::Job).to receive(:paginated_search).and_return({ jobs: [] })
        get "/jobs/all/owner?page=2", {}, @headers
        parsed = JSON.parse(response.body)
        expect(response.status).to eq 200
        expect(parsed['jobs'].to_json).to eq [].to_json
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:paginated_search)
          .and_raise(TD::Jobs::WrongAttributes)
        get "/jobs/all/owner?page=2", {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'POST /jobs' do
    context 'when :activated parameter is true' do
      let(:body) { @job.to_hash_without_nils.merge(activate: true) }
      it 'calls the :create_and_activate method from service' do
        expect(JobService.instance).to receive(:create_and_activate).once
        expect(JobService.instance).not_to receive(:create)
        post '/jobs', body.to_json, @headers
        expect(response.status).to eq 201
      end
    end

    context 'when :activated parameter is false' do
      let(:body) { @job.to_hash_without_nils.merge(activate: false) }
      it 'calls the :create method from service' do
        expect(JobService.instance).not_to receive(:create_and_activate)
        expect(JobService.instance).to receive(:create).once
        post '/jobs', body.to_json, @headers
      end
    end

    context 'when server responds with the created job' do
      it 'returns the created job' do
        expect(JobService.instance).to receive(:create_and_activate)
          .with(kind_of Hash)
          .and_return(@job)
        post '/jobs', @job.to_json, @headers
        expect(response.status).to eq 201
        expect(response.body).to eq @job.to_json
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Jobs::WrongAttributes)
        post '/jobs', @job.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'POST /jobs/invite' do
    let(:body) { @job.to_hash_without_nils.merge(invitation: @invitation.to_hash_without_nils) }
    context 'when server responds with the activated job' do
      it 'creates and send an invitation with the created job' do
        expect(JobService.instance).to receive(:create_and_activate)
          .with(kind_of Hash)
          .and_return(@job)
        expect(InvitationService.instance).to receive(:create_and_send)
        post '/jobs/invite', body.to_json, @headers
        expect(response.status).to eq 201
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(JobService.instance).to receive(:create_and_activate)
          .with(kind_of Hash)
          .and_raise(TD::Jobs::WrongAttributes)
        post '/jobs/invite', body.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'PUT /jobs/:id' do
    context 'when server responds with the updated job' do
      it 'returns the updated job' do
        expect(TD::Jobs::Job).to receive(:update)
          .with(kind_of(Fixnum), kind_of(Hash))
          .and_return(@job)
        put '/jobs/1', @job.to_json, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq @job.to_json
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:update)
          .with(kind_of(Fixnum), kind_of(Hash))
          .and_raise(TD::Jobs::WrongAttributes)
        put '/jobs/1', @job.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a EntityNotFound exception' do
      it 'returns 404' do
        expect(TD::Jobs::Job).to receive(:update)
          .with(kind_of(Fixnum), kind_of(Hash))
          .and_raise(TD::Jobs::EntityNotFound)
        put '/jobs/1', @job.to_json, @headers
        expect(response.status).to eq 404
      end
    end
  end

  describe 'PUT /jobs/:id/deactivate' do
    context 'when server responds with the deactivated job' do
      it 'returns the deactivated job' do
        expect(TD::Jobs::Job).to receive(:deactivate).with(kind_of Fixnum).and_return(@job)
        put '/jobs/1/deactivate', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq @job.to_json
      end
    end

    context 'when server raises a InvalidStatus exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:deactivate)
          .with(kind_of Fixnum)
          .and_raise(TD::Jobs::InvalidStatus)
        put '/jobs/1/deactivate', {}, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a EntityNotFound exception' do
      it 'returns 404' do
        expect(TD::Jobs::Job).to receive(:deactivate)
          .with(kind_of Fixnum)
          .and_raise(TD::Jobs::EntityNotFound)
        put '/jobs/1/deactivate', {}, @headers
        expect(response.status).to eq 404
      end
    end
  end

  describe 'PUT /jobs/:id/activate' do
    context 'when server responds with the activated job' do
      it 'returns the activated job' do
        expect(TD::Jobs::Job).to receive(:activate).with(kind_of Fixnum).and_return(@job)
        put '/jobs/1/activate', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq @job.to_json
      end
    end

    context 'when server raises a InvalidStatus exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:activate)
          .with(kind_of Fixnum)
          .and_raise(TD::Jobs::InvalidStatus)
        put '/jobs/1/activate', {}, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a EntityNotFound exception' do
      it 'returns 404' do
        expect(TD::Jobs::Job).to receive(:activate)
          .with(kind_of Fixnum)
          .and_raise(TD::Jobs::EntityNotFound)
        put '/jobs/1/activate', {}, @headers
        expect(response.status).to eq 404
      end
    end
  end

  describe 'PUT /jobs/:id/close' do
    context 'when server responds with the closed job' do
      it 'returns the closed job' do
        expect(TD::Jobs::Job).to receive(:close).with(kind_of Fixnum).and_return(@job)
        put '/jobs/1/close', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq @job.to_json
      end
    end

    context 'when server raises a InvalidStatus exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:close)
          .with(kind_of Fixnum)
          .and_raise(TD::Jobs::InvalidStatus)
        put '/jobs/1/close', {}, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a EntityNotFound exception' do
      it 'returns 404' do
        expect(TD::Jobs::Job).to receive(:close)
          .with(kind_of Fixnum)
          .and_raise(TD::Jobs::EntityNotFound)
        put '/jobs/1/close', {}, @headers
        expect(response.status).to eq 404
      end
    end
  end
end
