using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using System.Text.Json.Serialization;
using Whale.DAL.Abstraction;
using Whale.DAL.Models.Poll;

namespace Whale.DAL.Models
{
    public class Meeting:BaseEntity
    {
        public string Settings { get; set; }
        public DateTime StartTime { get; set; }
        [NotMapped]
        public DateTimeOffset EndTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }

        [NotMapped]
        public IEnumerable<Participant> Participants { get; set; }
        [NotMapped]
        public IEnumerable<PollResult> PollResults { get; set; }

        public Meeting() { }

        public Meeting(Meeting meeting)
        {
            Id = meeting.Id;
            Settings = meeting.Settings;
            StartTime = meeting.StartTime;
            AnonymousCount = meeting.AnonymousCount;
            IsScheduled = meeting.IsScheduled;
            IsRecurrent = meeting.IsRecurrent;

            Participants = meeting.Participants;
            PollResults = meeting.PollResults;
        }

        public Meeting(Meeting meeting, IEnumerable<Participant> participants) : this(meeting)
        {
            Participants = participants;
        }

        public Meeting(Meeting meeting, IEnumerable<PollResult> pollResults) : this(meeting)
        {
            PollResults = pollResults;
        }
    }
}
