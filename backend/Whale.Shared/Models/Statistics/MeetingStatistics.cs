using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Whale.Shared.Models.Statistics
{
    public class MeetingStatistics
    {
        public Guid MeetingId { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? StartTime { get; set; }
        public int MeetingDurationMS { get; set; }
        //public List<MeetingUserStatistics> UsersStats { get; set; }
    }
}
