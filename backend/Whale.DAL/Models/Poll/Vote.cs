using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models.Poll
{
    public class Vote : BaseEntity
    {
        public string PollId { get; set; }
        public string MeetingId { get; set; }
        public string[] ChoosedOptions { get; set; }
        public Voter User { get; set; }
    }
}
