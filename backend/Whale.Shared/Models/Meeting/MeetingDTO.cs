using System;
using System.Collections.Generic;
using Whale.Shared.Models.Participant;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingDTO
    {
        public Guid Id { get; set; }
        public string Settings { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }

        public ICollection<ParticipantDTO> Participants { get; set; }
    }
}
