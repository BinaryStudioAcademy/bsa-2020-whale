using System;
using Whale.DAL.Models;

namespace Whale.Shared.Models.Participant
{
    public class ParticipantCreateDTO
    {
        public ParticipantRole Role { get; set; }
        public string UserEmail { get; set; }
        public Guid MeetingId { get; set; }
    }
}
