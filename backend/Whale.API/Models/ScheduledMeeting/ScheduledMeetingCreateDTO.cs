using System;
using System.Collections.Generic;
using Whale.DAL.Models;

namespace Whale.API.Models.ScheduledMeeting
{
    public class ScheduledMeetingCreateDTO
    {
        public string Settings { get; set; }
        public DateTimeOffset ScheduledTime { get; set; }
        public int AnonymousCount { get; set; }
        public IEnumerable<AgendaPoint> AgendaPoints { get; set; }
    }
}
