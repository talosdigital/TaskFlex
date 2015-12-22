class InvitationService
  include Singleton

  def create(attrs)
    TD::Jobs::Invitation.create(attrs)
  end

  def create_and_send(attrs)
    invitation = self.create(attrs)
    invitation.send
    TaskFlexNotificator.delay.invite_tasker(invitation)
    invitation
  end

  # Appends the owner information for a specific invitation
  # @param invitation [TD::Jobs::Invitation] Specific invitation to be appended with its owner
  # @param owner_attrs [Symbol] one or more attributes that are to be included in the owner info.
  #   NOTE: If zero owner_attrs were given, ALL owner information will be returned.
  # @return [Hash] Hash representation of the invitation with the owner information, nil if no owner
  #   associated to the given invitation was found.
  def append_owner(invitation, *owner_attrs)
    owner = UserService.instance.user_information(invitation.job.owner_id, *owner_attrs)
    unless owner.nil?
      return invitation.to_hash_without_nils.merge(owner: owner)
    end
    nil
  end
end
