using System;
using System.Collections.Generic;
using System.Text;

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
    }
}
