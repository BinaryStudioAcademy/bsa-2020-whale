using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.API.Models.ScheduledMeeting
{
    public class ScheduledMeetingExternal
    {
        public string Email { get; set; }
        public DateTimeOffset ScheduledTime { get; set; }
    }
}
