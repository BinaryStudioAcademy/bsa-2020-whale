using System;
using System.Collections.Generic;
using System.Text;
using Whale.DAL.Abstraction;

namespace Whale.DAL.Models
{
    public class Meeting:BaseEntity
    {
        public string Settings { get; set; }
        public DateTime StartTime { get; set; }
        public int AnonymousCount { get; set; }
        public bool IsScheduled { get; set; }
        public bool IsRecurrent { get; set; }

        public IEnumerable<Participant> Participants { get; set; }
    }
}
