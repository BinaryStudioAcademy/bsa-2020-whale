using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.Shared.Models.Statistics
{
    public class MeetingUserStatistics
    {
        public string Id { get; set; }
        public Guid UserId { get; set; }
        public Guid MeetingId { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public long DurationTime { get; set; }
        public long SpeechTime { get; set; }
        public long PresenceTime { get; set; }
        public string DurationString { get; set; }
    }
}
