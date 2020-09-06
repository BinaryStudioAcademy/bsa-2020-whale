using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Whale.DAL.Abstraction;
using Polls = Whale.DAL.Models.Poll;

namespace Whale.DAL.Models
{
    public class Meeting : BaseEntity
    {
        public string Settings { get; set; }
        public string Topic { get; set; }
        public string Description { get; set; }
        public DateTimeOffset StartTime { get; set; }
        public DateTimeOffset? EndTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }

        [NotMapped]
        public IEnumerable<Participant> Participants { get; set; }

        public IEnumerable<Polls.Poll> PollResults { get; set; }
        public IEnumerable<AgendaPoint> AgendaPoints { get; set; }
        public Meeting() { }

        public Meeting(Meeting meeting)
        {
            Id = meeting.Id;
            Settings = meeting.Settings;
            StartTime = meeting.StartTime;
            EndTime = meeting.EndTime;
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

        public Meeting(Meeting meeting, IEnumerable<Polls.Poll> pollResults) : this(meeting)
        {
            PollResults = pollResults;
        }
    }
}
