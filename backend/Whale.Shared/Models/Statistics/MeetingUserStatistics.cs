using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.Shared.Models.Statistics
{
    public class MeetingUserStatistics
    {
        public Guid UserId { get; set; }
        public TimeSpan? SpeechTime { get; set; }
        public TimeSpan? PresenceTime { get; set; }
    }
}
