class JobService
  include Singleton

  def create(attrs)
    TD::Jobs::Job.create(attrs)
  end

  def create_and_activate(attrs)
    job = self.create(attrs)
    job.activate
    job
  end

  def activate(job_id)
    TD::Jobs::Job.activate(job_id)
  end
end
