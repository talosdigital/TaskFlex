class TaskFlexNotificator < ApplicationMailer
  include Roadie::Rails::Automatic

  def welcome_user(user)
    mail to: user.email, subject: 'Welcome to TaskFlex!'
  end

  def invite_tasker(invitation)
    @invitation = invitation
    @job = invitation.job
    return if @job.metadata.nil? || @job.metadata['contact'].nil?
    recipient = MailHelper.user_email(@invitation.provider_id)
    mail to: recipient, subject: "You have been invited to work in a job!"
  end

  def accept_invitation(invitation, offer_id)
    @invitation = invitation
    @offer_id = offer_id
    @job = invitation.job
    return if @job.metadata.nil? || @job.metadata['contact'].nil?
    @owner = UserHelper.basic_info_for(@job.owner_id)
    @tasker = UserHelper.basic_info_for(@invitation.provider_id)
    recipient = MailHelper.user_email(@owner[:id])
    mail to: recipient, subject: "Your invitation has been accepted!"
  end

  def reject_invitation(invitation)
    @invitation = invitation
    @job = invitation.job
    return if @job.metadata.nil? || @job.metadata['contact'].nil?
    @owner = UserHelper.basic_info_for(@job.owner_id)
    @tasker = UserHelper.basic_info_for(@invitation.provider_id)
    recipient = MailHelper.user_email(@owner[:id])
    mail to: recipient, subject: "Your invitation has been rejected."
  end

  def accept_offer(offer)
    @offer = offer
    @job = offer.job
    @owner = UserHelper.basic_info_for(@job.owner_id)
    recipient = MailHelper.user_email(@offer.provider_id)
    mail to: recipient, subject: "Your offer has been accepted!"
  end

  def reject_offer(offer)
    @offer = offer
    @job = offer.job
    @owner = UserHelper.basic_info_for(@job.owner_id)
    recipient = MailHelper.user_email(@offer.provider_id)
    mail to: recipient, subject: "Your offer has been rejected."
  end

  def return_offer(offer)
    @offer = offer
    @job = offer.job
    @owner = UserHelper.basic_info_for(@job.owner_id)
    recipient = MailHelper.user_email(@offer.provider_id)
    mail to: recipient, subject: "Your offer has been returned."
  end

  def reset_password_request(auth)
    @auth = auth
    recipient = @auth.email
    mail to: recipient, subject: "Reset your password"
  end
end
