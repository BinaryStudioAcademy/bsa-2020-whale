using System;
using System.Collections.Generic;
using Whale.Shared.Models.Participant;
using Whale.Shared.Models.Poll;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingDTO
    {
        public Guid Id { get; set; }
        public string Settings { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset? EndTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }
        public bool IsVideoAllowed { get; set; }
        public bool IsAudioAllowed { get; set; }
        public bool IsWhiteboard { get; set; }
        public bool IsPoll { get; set; }

        public IEnumerable<ParticipantDTO> Participants { get; set; }
        public IEnumerable<PollResultDTO> PollResults { get; set; }
    }
}
