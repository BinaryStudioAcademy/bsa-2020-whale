using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class PollResult : BaseEntity
    {
        public Guid PollId { get; set; }
        public string Title { get; set; }
        public bool IsAnonymous { get; set; }
        public List<OptionResult> OptionResults { get; set; } = new List<OptionResult>();
        public int TotalVoted { get; set; }
        public int VoteCount { get; set; }

        public Guid MeetingId { get; set; }
    }
}
