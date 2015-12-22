require 'rails_helper'
require 'faker'

RSpec.describe TaskFlex::Auths::Root do
  before :all do
    @headers = { 'Content-Type' => 'application/json', 'Accept' => 'application/json' }
    # A dirty way to stub the helper.
    TaskFlex::Root.helpers do
      def current_user
        TD::Users::User.new(id: Faker::Lorem.word, first_name: Faker::Name.first_name,
                            last_name: Faker::Name.last_name)
      end

      def user_roles
        []
      end
    end
  end

  before :each do
    @auth_attrs = { user_id: Faker::Lorem.word, token: Faker::Bitcoin.address,
                    email: Faker::Internet.email, email_token: Faker::Bitcoin.address }
    @user_attrs = { id: @auth_attrs[:user_id], first_name: Faker::Name.first_name,
                    last_name: Faker::Name.last_name, gender: "female",
                    email: @auth_attrs[:email], password: Faker::Internet.password,
                    birth_date: Faker::Date.backward(2000).to_s, height: 180, weight: 67,
                    auth: @auth_attrs }
    @auth = TD::Users::Auth.new(@auth_attrs)
    @user = TD::Users::User.new(@user_attrs)
    @create_attrs = @auth_attrs.merge(@user_attrs).except(:token, :auth, :user_id, :id)
    @auth_send = { email: @user_attrs[:email], password: @user_attrs[:password] }
    @update_pass_attrs = { current_password: @user_attrs[:password],
                           new_password: @user_attrs[:password] }
  end

  describe 'POST /auths' do
    context 'when server responds with the authenticated user' do
      it 'calls the UserService with the received user' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create).with(kind_of Hash).and_return(@user)
        expect(UserService.instance).to receive(:authenticate)
          .with(@user, kind_of(Hash))
          .and_return(@user).once
        post '/auths', @create_attrs.to_json, @headers
        expect(response.status).to eq 201
        expect(response.body).to eq @user.to_json
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        post '/auths', @create_attrs.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        post '/auths', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        post '/auths', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when the given email already exists' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([@user])
        post '/auths', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'POST /auths/tasker' do
    context 'when server responds with the authenticated tasker' do
      it 'calls the UserService with the received user' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create).with(kind_of Hash).and_return(@user)
        expect(UserService.instance).to receive(:authenticate)
          .with(@user, kind_of(Hash))
          .and_return(@user).once
        post '/auths/tasker', @create_attrs.to_json, @headers
        expect(response.status).to eq 201
        expect(response.body).to eq @user.to_json
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        post '/auths/tasker', @create_attrs.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        post '/auths/tasker', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        post '/auths/tasker', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when the given email already exists' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([@user])
        post '/auths/tasker', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'POST /auths/owner' do
    context 'when server responds with the authenticated owner' do
      it 'calls the UserService with the received user' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create).with(kind_of Hash).and_return(@user)
        expect(UserService.instance).to receive(:authenticate)
          .with(@user, kind_of(Hash))
          .and_return(@user).once
        post '/auths/owner', @create_attrs.to_json, @headers
        expect(response.status).to eq 201
        expect(response.body).to eq @user.to_json
        json_response = JSON.parse(response.body)
        expect(json_response['auth']['token']).to eq @auth.token
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        post '/auths/owner', @create_attrs.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        post '/auths/owner', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([])
        expect(TD::Users::User).to receive(:create)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        post '/auths/owner', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when the given email already exists' do
      it 'returns 400' do
        expect(TD::Users::User).to receive(:find).with(kind_of Hash).and_return([@user])
        post '/auths/owner', @create_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /auths/login' do
    context 'when server responds with 200' do
      it 'returns the authentication token' do
        expect(TD::Users::Auth).to receive(:log_in)
          .with(kind_of Hash)
          .and_return(@auth_attrs.except(:user_id))
        post '/auths/login', @auth_send.to_json, @headers
        expect(response.status).to eq 201
        json_response = JSON.parse(response.body)
        expect(json_response['token']).to eq @auth.token
        expect(json_response['email']).to eq @auth.email
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::Auth).to receive(:log_in)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        post '/auths/login', @auth_send.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:log_in)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        post '/auths/login', @auth_send.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:log_in)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        post '/auths/login', @auth_send.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /auths/facebook' do
    context 'when server responds with 200' do
      it 'returns the authentication token' do
        expect(TD::Users::Auth).to receive(:facebook)
          .with(kind_of String)
          .and_return(@auth)
        allow(TD::Users::User).to receive(:update).and_return(@user)
        post '/auths/facebook', { token: @auth.token }.to_json, @headers
        expect(response.status).to eq 201
        json_response = JSON.parse(response.body)
        expect(json_response['token']).to eq @auth.token
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::Auth).to receive(:facebook)
          .with(kind_of String)
          .and_raise(TD::Users::AuthFailed)
        post '/auths/facebook', { token: @auth.token }.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:facebook)
          .with(kind_of String)
          .and_raise(TD::Users::GenericError)
        post '/auths/facebook', { token: @auth.token }.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'DELETE /logout' do
    context 'when server responds true' do
      it 'returns success with true value' do
        expect(TD::Users::Auth).to receive(:log_out)
          .with(kind_of String)
          .and_return(true)
        delete '/auths/logout', {}, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq({ success: true }.to_json)
      end
    end

    # This means that User-Token is invalid.
    context 'when server raises an AuthFailed exception' do
      it 'returns 200' do
        expect(TD::Users::Auth).to receive(:log_out)
          .with(kind_of String)
          .and_raise(TD::Users::AuthFailed)
        delete '/auths/logout', {}, @headers
        expect(response.status).to eq 200
      end
    end

    # This means that User-Token was not sent.
    context 'when server raises an InvalidParam exception' do
      it 'returns 200' do
        expect(TD::Users::Auth).to receive(:log_out)
          .with(kind_of String)
          .and_raise(TD::Users::InvalidParam)
        delete '/auths/logout', {}, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:log_out)
          .with(kind_of String)
          .and_raise(TD::Users::GenericError)
        delete '/auths/logout', {}, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'PUT /update_password' do
    context 'when server responds true' do
      it 'returns success with true value' do
        expect(TD::Users::Auth).to receive(:update_password)
          .with(kind_of Hash)
          .and_return(true)
        put '/auths/update_password', @update_pass_attrs.to_json, @headers
        expect(response.status).to eq 200
        expect(response.body).to eq({ success: true }.to_json)
      end
    end

    context 'when server raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:update_password)
          .with(kind_of Hash)
          .and_raise(TD::Users::ValidationError)
        put '/auths/update_password', @update_pass_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when server raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::Auth).to receive(:update_password)
          .with(kind_of Hash)
          .and_raise(TD::Users::AuthFailed)
        put '/auths/update_password', @update_pass_attrs.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when server raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:update_password)
          .with(kind_of Hash)
          .and_raise(TD::Users::GenericError)
        put '/auths/update_password', @update_pass_attrs.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'GET /current' do
    context 'when server responds with the user information' do
      it 'returns 200 with all information' do
        get '/auths/current', {}, @headers
        expect(response.status).to eq 200
      end
    end
  end

  describe 'POST /reset_password/request' do
    let(:body) do
      { email: "hey@hey.com" }
    end
    let(:mail) { double(ActionMailer::MessageDelivery) }
    context 'when request succeeds' do
      it 'sends an email with the given token' do
        allow(TD::Users::Auth).to receive(:reset_password_request).and_return(@auth)
        expect(TaskFlexNotificator).to receive(:delay).and_return(mail)
        expect(mail).to receive(:reset_password_request).with(@auth)
        post '/auths/reset_password/request', body.to_json, @headers
        expect(response.status).to eq 201
      end

      it 'responds with success true' do
        allow(TD::Users::Auth).to receive(:reset_password_request).and_return(@auth)
        allow(TaskFlexNotificator).to receive(:delay).and_return(mail)
        allow(mail).to receive(:reset_password_request)
        post '/auths/reset_password/request', body.to_json, @headers
        expect(response.body).to eq({ success: true }.to_json)
      end
    end

    context 'when raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:reset_password_request)
          .and_raise(TD::Users::ValidationError)
        post '/auths/reset_password/request', body.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::Auth).to receive(:reset_password_request)
          .and_raise(TD::Users::AuthFailed)
        post '/auths/reset_password/request', body.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:reset_password_request)
          .and_raise(TD::Users::GenericError)
        post '/auths/reset_password/request', body.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end

  describe 'PUT /reset_password' do
    let(:body) do
      { password: "abcABC123", verify_token: "abc-def-ghi" }
    end
    context 'when server responds true' do
      it 'returns 200' do
        expect(TD::Users::Auth).to receive(:reset_password).and_return(true)
        put '/auths/reset_password', body.to_json, @headers
        expect(response.status).to eq 200
      end
    end

    context 'when raises a ValidationError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:reset_password)
          .and_raise(TD::Users::ValidationError)
        put '/auths/reset_password', body.to_json, @headers
        expect(response.status).to eq 400
      end
    end

    context 'when raises an AuthFailed exception' do
      it 'returns 401' do
        expect(TD::Users::Auth).to receive(:reset_password)
          .and_raise(TD::Users::AuthFailed)
        put '/auths/reset_password', body.to_json, @headers
        expect(response.status).to eq 401
      end
    end

    context 'when raises a GenericError exception' do
      it 'returns 400' do
        expect(TD::Users::Auth).to receive(:reset_password)
          .and_raise(TD::Users::GenericError)
        put '/auths/reset_password', body.to_json, @headers
        expect(response.status).to eq 400
      end
    end
  end
end
