using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class Vote : BaseEntity
    {
        public Guid PollId { get; set; }
        public Guid MeetingId { get; set; }
        public string[] ChoosedOptions { get; set; }
        public Voter User { get; set; }
    }
}
