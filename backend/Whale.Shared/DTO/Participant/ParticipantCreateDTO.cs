using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.DTO.Participant
{
    public class ParticipantCreateDTO
    {
        public ParticipantRole Role { get; set; }
        public string UserEmail { get; set; }
        public Guid MeetingId { get; set; }
    }
}
