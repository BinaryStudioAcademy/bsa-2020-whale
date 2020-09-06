using System;
using System.Collections.Generic;
using System.Text;

namespace Whale.Shared.Models.ElasticModels.Statistics
{
    public class UpdateStatistics
    {
        public Guid MeetingId { get; set; }
        public string Email { get; set; }
        public long SpeechTime { get; set; }
        public long PresenceTime { get; set; }
    }
}
