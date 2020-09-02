using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.Shared.Models.Statistics
{
    public class MeetingStatistics
    {
        public MeetingStatistics()
        {
            CorrelationId = Guid.NewGuid().ToString();
        }
        public string CorrelationId { get; set; }
        public Guid MeetingId { get; set; }
        public TimeSpan? MeetingDuration { get; set; }
        public double? MeetingDurationNumber { get; set; }
        public List<MeetingUserStatistics> UsersStats { get; set; }
    }
}
