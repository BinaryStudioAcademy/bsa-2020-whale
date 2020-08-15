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

        public ICollection<string> Options { get; set; }
    }
}
