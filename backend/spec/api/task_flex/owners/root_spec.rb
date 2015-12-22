require 'rails_helper'
require 'faker'

RSpec.describe TaskFlex::Owners::Root do
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

  describe 'GET job/:job_id' do
    let(:job) { TD::Jobs::Job.new }
    context 'when server responds with one job' do
      it 'returns that job' do
        expect(TD::Jobs::Job).to receive(:search).and_return([job])
        get '/owners/job/1', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq job.to_json
      end
    end

    context 'when server responds with no jobs' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:search).and_return([])
        get '/owners/job/1', {}, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Job).to receive(:search).and_raise(TD::Jobs::WrongAttributes)
        get '/owners/job/1', {}, @headers
        expect(response.status).to eq 400
      end
    end
  end
end
