require 'rails_helper'
require 'faker'

RSpec.describe TaskFlex::Offers::Root do
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

  describe 'GET /offers/tasker' do
    let(:job) { TD::Jobs::Job.new(owner_id: 1) }
    let(:offer) { TD::Jobs::Offer.new(job: job) }
    let(:owner) { TD::Users::User.new }
    context 'when server responds correctly with offers' do
      it 'returns 200 with the offers' do
        expect(TD::Jobs::Offer).to receive(:paginated_search)
          .and_return({'offers' => [offer, offer]})
        allow(TD::Users::User).to receive(:find)
          .with(kind_of Hash)
          .and_return([owner])
        get "/offers/tasker", {}, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Offer).to receive(:paginated_search).and_raise(TD::Jobs::WrongAttributes)
        get "/offers/tasker", {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'POST /offers' do
    let(:body) do
      { job_id: 1, invitation_id: Faker::Number.number(3).to_i, description: Faker::Lorem.word,
        metadata: {}, accept: true }
    end
    let(:mail) { double(ActionMailer::MessageDelivery) }
    let(:offer) { TD::Jobs::Offer.new }
    context 'when :accept and :invitation_id params are present' do
      it 'accepts the given invitation first' do
        expect(TD::Jobs::Invitation).to receive(:accept).with(body[:invitation_id])
        allow(TD::Jobs::Offer).to receive(:create).and_return(offer)
        allow(offer).to receive(:send)
        allow(TaskFlexNotificator).to receive(:delay).and_return(mail)
        allow(mail).to receive(:accept_invitation)
        post "/offers/", body.to_json , @headers
        expect(response.status).to eq 201
      end
    end

    context 'when :accept param is not true' do
      it 'doesn\'t accept the given invitation' do
        expect(TD::Jobs::Invitation).not_to receive(:accept).with(body[:invitation_id])
        allow(TD::Jobs::Offer).to receive(:create).and_return(offer)
        allow(offer).to receive(:send)
        allow(TaskFlexNotificator).to receive(:delay).and_return(mail)
        allow(mail).to receive(:accept_invitation)
        post "/offers/", body.except(:accept).to_json , @headers
        expect(response.status).to eq 201
      end
    end

    context 'when the :auto_send param is not true' do
      it 'doesn\'t send the created offer' do
        expect(TD::Jobs::Invitation).to receive(:accept).with(body[:invitation_id])
        allow(TD::Jobs::Offer).to receive(:create).and_return(offer)
        expect(offer).not_to receive(:send)
        allow(TaskFlexNotificator).to receive(:delay).and_return(mail)
        allow(mail).to receive(:accept_invitation)
        post "/offers/", body.merge(auto_send: false).to_json , @headers
        expect(response.status).to eq 201
      end
    end
  end

  describe 'GET /offers/current/taskers' do
    context 'when the given status is empty' do
      it 'sets statuses to all possible values' do
        expect(TD::Jobs::Offer).to receive(:paginated_search)
          .with(hash_including(status: [:ACCEPTED, :REJECTED, :SENT, :RETURNED, :RESENT]),
                anything, anything)
          .and_return('offers' => [])
        get "/offers/current/taskers", { status: '' }, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when the given status is \'PENDING\'' do
      it 'sets statuses to an array including :SENT, :RETURNED and :RESENT' do
        expect(TD::Jobs::Offer).to receive(:paginated_search)
          .with(hash_including(status: [:SENT, :RETURNED, :RESENT]), anything, anything)
          .and_return('offers' => [])
        get "/offers/current/taskers", { status: 'PENDING' }, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when the given status is \'ACCEPTED\'' do
      it 'sets statuses to :ACCEPTED' do
        expect(TD::Jobs::Offer).to receive(:paginated_search)
          .with(hash_including(status: :ACCEPTED), anything, anything)
          .and_return('offers' => [])
        get "/offers/current/taskers", { status: 'ACCEPTED' }, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when the given status is \'REJECTED\'' do
      it 'sets statuses to :REJECTED' do
        expect(TD::Jobs::Offer).to receive(:paginated_search)
          .with(hash_including(status: :REJECTED), anything, anything)
          .and_return('offers' => [])
        get "/offers/current/taskers", { status: 'REJECTED' }, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Offer).to receive(:paginated_search).and_raise TD::Jobs::WrongAttributes
        get "/offers/current/taskers", {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /offers/past/taskers' do
    context 'when :page parameter is given' do
      it 'calls :paginated_search method with propper parameters' do
        expect(TD::Jobs::Offer).to receive(:paginated_search)
          .with(anything, 10, anything)
          .and_return('offers' => [])
        get "/offers/past/taskers", { page: '10' }, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when :per_page parameter is given' do
      it 'calls :paginated_search method with propper parameters' do
        expect(TD::Jobs::Offer).to receive(:paginated_search)
          .with(anything, anything, 20)
          .and_return('offers' => [])
        get "/offers/past/taskers", { per_page: '20' }, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when server raises a WrongAttributes exception' do
      it 'returns 400' do
        expect(TD::Jobs::Offer).to receive(:paginated_search).and_raise TD::Jobs::WrongAttributes
        get "/offers/past/taskers", {}, @headers
        expect(response.status).to eq 400
      end
    end
  end
end
