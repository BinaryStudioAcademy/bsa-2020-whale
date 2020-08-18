using System;
using System.Collections.Generic;
using System.Text;
using Whale.Shared.DTO.Participant;
using Whale.Shared.DTO.Poll;

namespace Whale.Shared.DTO.Meeting
{
    public class MeetingDTO
    {
        public Guid Id { get; set; }
        public string Settings { get; set; }
        public DateTime StartTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }

        public IEnumerable<ParticipantDTO> Participants { get; set; }
        public IEnumerable<PollResultDTO> PollResults { get; set; }
    }
}
