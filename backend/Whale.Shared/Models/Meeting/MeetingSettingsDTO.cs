using Whale.Shared.Jobs;

namespace Whale.Shared.Models.Meeting
{
    public class MeetingSettingsDTO
    {
        public string MeetingHostEmail { get; set; }
        public bool IsVideoAllowed { get; set; }
        public bool IsAudioAllowed { get; set; }
        public bool IsWhiteboard { get; set; }
        public bool IsAllowedToChooseRoom { get; set; }
        public bool IsPoll { get; set; }
        public JobRecurrenceEnum Recurrence { get; set; }
        public string RecognitionLanguage { get; set; }
        public string SelectMusic { get; set; }
        public string MeetingType { get; set; }
    }
}
