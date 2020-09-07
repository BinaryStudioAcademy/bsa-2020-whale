using System;

namespace Whale.Shared.Models.ElasticModels.Statistics
{
    public class MeetingUserStatistics
    {
        public string Id { get; set; }
        public Guid UserId { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public long DurationTime { get; set; }
        public long SpeechTime { get; set; }
        public long PresenceTime { get; set; }
    }
}
