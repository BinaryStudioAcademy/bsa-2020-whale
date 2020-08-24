using System;
using System.Collections.Generic;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class Poll : BaseEntity
    {
        public Guid MeetingId { get; set; }
        public Meeting Meeting { get; set; }
        public string Title { get; set; }
        public bool IsAnonymous { get; set; }
        public bool IsSingleChoice { get; set; }
        public DateTimeOffset CreatedAt { get; set; }

        public IEnumerable<OptionResult> OptionResults { get; set; } = new List<OptionResult>();
        public IEnumerable<Voter> VotedUsers { get; set; } = new List<Voter>();
    }
}
