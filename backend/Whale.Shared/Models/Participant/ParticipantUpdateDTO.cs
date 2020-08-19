using System;
using Whale.DAL.Models;

namespace Whale.Shared.Models.Participant
{
    public class ParticipantUpdateDTO
    {
        public Guid Id { get; set; }
        public ParticipantRole Role { get; set; }
        public Guid UserId { get; set; }
        public Guid MeetingId { get; set; }
    }
}
