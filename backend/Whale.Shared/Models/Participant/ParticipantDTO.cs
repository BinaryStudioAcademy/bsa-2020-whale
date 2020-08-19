using System;
using Whale.DAL.Models;
using Whale.Shared.Models.Meeting;
using Whale.Shared.Models.User;

namespace Whale.Shared.Models.Participant
{
    public class ParticipantDTO
    {
        public Guid Id { get; set; }
        public ParticipantRole Role { get; set; }
        public UserDTO User { get; set; }
        public string StreamId { get; set; }
        public string ActiveConnectionId { get; set; }
        public MeetingDTO Meeting { get; set; }
    }
}
