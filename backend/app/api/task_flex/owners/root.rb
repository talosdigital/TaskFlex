module TaskFlex
  module Owners
    class Root < Grape::API

      before do
        authorize! :owner
      end

      desc 'gets by id a job that belongs to the current owner'
      params do
        # owner id retrieved from the token in headers.
        requires :job_id, type: String, desc: 'Id of the job to be queried'
      end
      get 'job/:job_id' do
        begin
          owner = current_user
          job_filter = { owner_id: owner.id, id: params[:job_id] }
          job = TD::Jobs::Job.search(job_filter.to_json)
          if (job.count != 1)
            error!("Job could not be found or doesn't belong to you", :bad_request)
          else
            present job.first
          end
        rescue TD::Jobs::WrongAttributes => exception
          error!(exception.message, :bad_request)
        end
      end
    end
  end
end
