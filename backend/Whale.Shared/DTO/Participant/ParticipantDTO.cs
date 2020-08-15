using System;
using System.Collections.Generic;
using Whale.Shared.DTO.Meeting;
using Whale.Shared.DTO.User;

namespace Whale.Shared.DTO.Participant
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
