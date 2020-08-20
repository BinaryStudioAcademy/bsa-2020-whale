using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
	public class Participant : BaseEntity
	{
		public ParticipantRole Role { get; set; }
		public Guid UserId { get; set; }
		public User User { get; set; }
		public Guid MeetingId { get; set; }
		public Meeting Meeting { get; set; }

		public Participant() { }

		public Participant(Participant participant)
		{
			Id = participant.Id;
			Role = participant.Role;
			UserId = participant.UserId;
			MeetingId = participant.MeetingId;
			User = participant.User;
			Meeting = participant.Meeting;
		}

		public Participant(Participant participant, Meeting meeting) : this(participant)
		{
			Meeting = meeting;
		}
	}
}
