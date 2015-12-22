require Rails.root.join('lib', 'task_flex', 'helpers', 'mail_helper.rb')
require Rails.root.join('lib', 'task_flex', 'helpers', 'date_helper.rb')
require Rails.root.join('lib', 'task_flex', 'helpers', 'user_helper.rb')

class ApplicationMailer < ActionMailer::Base
  default from: TaskFlex.configuration.email_options[:from]
end
